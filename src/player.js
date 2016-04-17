'use strict';
const Data = require('./data')
  .Data,
  Skills = require('./skills')
  .Skills,
  crypto = require('crypto'),
  ansi = require('sty'),
  util = require('util'),
  events = require('events'),
  wrap = require('wrap-ansi');

const npcs_scripts_dir = __dirname + '/../scripts/player/';
const l10n_dir = __dirname + '/../l10n/scripts/player/';
const statusUtil = require('./status');

var Player = function PlayerConstructor(socket) {
  var self = this;
  self.name = '';
  self.description = '';
  self.location = null;
  self.locale = null;
  self.prompt_string =
    '%health_condition <blue>||</blue> %sanity_condition\n<blue><bold>[ </bold></blue>';
  self.combat_prompt =
    "<bold>|| %player_condition <blue>||</blue> %target_condition ||</bold>\r\n>";
  self.password = null;
  self.inventory = [];
  self.equipment = {};

  // In combat is either false or an NPC vnum
  self.in_combat = false;

  // Attributes
  self.attributes = {
    max_health: 100,
    health: 30,
    max_sanity: 100,
    sanity: 30,
    stamina: 1,
    willpower: 1,
    quickness: 1,
    cleverness: 1,
    level: 1,
    experience: 0,
    mutagens: 0,
    description: 'A person.'
  };

  self.preferences = {
    target: 'body',
    wimpy: 30,
    stance: 'normal',
    roomdescs: 'default' //default = verbose 1st time, short after.
  };

  self.explored = [];

  // Anything affecting the player
  self.effects = {};

  // Skills the players has
  self.skills = {};

  /**#@+
   * Mutators
   */
  self.getPrompt = () => self.prompt_string;
  self.getCombatPrompt = () => self.combat_prompt;
  self.getLocale = () => self.locale;
  self.getName = () => self.name;
  self.getDescription = () => self.attributes.description;
  self.getLocation = () => self.location;
  self.getSocket = () => socket;
  self.getInventory = () => self.inventory;
  self.getAttributes = () => self.attributes || {};

  self.getAttribute = attr => typeof self.attributes[attr] !== 'undefined' ?
    self.attributes[attr] : false;

  self.getPreference = pref => typeof self.preferences[pref] !== 'undefined' ?
    self.preferences[pref] : false;

  self.getSkills = skill =>
    typeof self.skills[skill] !== 'undefined' ? self.skills[skill] :
      self.skills;

  self.getPassword = () => self.password; // Returns hash.
  self.isInCombat = () => self.in_combat;

  self.setPrompt = str => self.prompt_string = str;
  self.setCombatPrompt = str => self.combat_prompt = str;
  self.setLocale = locale => self.locale = locale;
  self.setName = newname self.name = newname;
  self.setDescription = newdesc =>
    self.attributes.description =
      newdesc;

  self.setLocation = function(loc) { self.location = loc; };
  self.setPassword = function(pass) {
    self.password = crypto.createHash('md5')
      .update(pass)
      .digest('hex');
  };
  self.setGender = function(gender) { self.gender = gender.toUpperCase(); }
  self.getGender = function() {
    return self.gender;
  }
  self.addItem = function(item) { self.inventory.push(item); };
  self.removeItem = function(item) {
    self.inventory = self.inventory.filter(
      function(i) {
        return item !== i;
      });
  };
  self.setInventory = function(inv) { self.inventory = inv; };
  self.setInCombat = function(combat) { self.in_combat = combat; };
  self.setAttribute = function(attr, val) { self.attributes[attr] = val; };
  self.setPreference = function(pref, val) { self.preferences[pref] = val; };
  self.addSkill = function(name, skill) { self.skills[name] = skill; };
  /**#@-*/

  self.checkStance = stance => self.preferences.stance === stance.toLowerCase();

  /**
  * To keep track of which rooms the player has already explored.
  * @param int Vnum of room explored...
  * @return boolean True if they have already been there. Otherwise false.
  */
  self.explore = vnum => {
    if (self.explored.indexOf(vnum) === -1) {
      self.explored.push(vnum);
      util.log(player.getName() + ' explored room #' + vnum + ' for the first time.');
      return false;
    }
    util.log(player.getName() + ' moves to room #' + vnum);
    return true;
  };

  /**
  * Spot checks
  * @param int Difficulty -- What they need to beat with their roll
  * @param int Bonus -- The bonus they get on their roll
  * @return boolean Success
  */
  self.spot = (difficulty, bonus) => {
    bonus = bonus || 1;
    difficulty = difficulty || 1;

    let chance = (Math.random() * bonus);
    let spotted = (self.getAttribute('cleverness') + chance >= difficulty);

    util.log("Spot check success: ", spotted);
    return spotted;
  }

  /**
   * Get currently applied effects
   * @param string aff
   * @return Array|Object
   */
  self.getEffects = function(aff) {
    if (aff) {
      return typeof self.effects[aff] !== 'undefined' ? self.effects[aff] :
        false;
    }
    return self.effects;
  };

  /**
   * Add, activate and set a timer for an affect
   * @param string name
   * @param object affect
   */
  self.addAffect = function(name, affect) {
    if (affect.activate) {
      affect.activate();
    }

    var deact = function() {
      if (affect.deactivate) {
        affect.deactivate();
        self.prompt();
      }
      self.removeAffect(name);
    };

    if (affect.duration) {
      affect.timer = setTimeout(deact, affect.duration * 1000);
    } else if (affect.event) {
      self.on(affect.event, deact);
    }
    self.effects[name] = affect;
  };

  self.removeAffect = function(aff) {
    if (self.effects[aff].event) {
      self.removeListener(self.effects[aff].event, self.effects[aff].deactivate);
    } else {
      clearTimeout(self.effects[aff].timer);
    }
    delete self.effects[aff];
  };

  /**
   * Get and possibly hydrate an equipped item
   * @param string  slot    Slot the item is equipped in
   * @param boolean hydrate Return an actual item or just the uuid
   * @return string|Item
   */
  self.getEquipped = function(slot, hydrate) {
    if (!slot) {
      return self.equipment;
    }

    if (!(slot in self.equipment)) {
      return false;
    }

    hydrate = hydrate || false;
    if (hydrate) {
      return self.getInventory()
        .filter(function(i) {
          return i.getUuid() === self.equipment[slot];
        })[0];
    }
    return self.equipment[slot];
  };

  /**
   * "equip" an item
   * @param string wear_location The location this item is worn
   * @param Item   item
   */
  self.equip = function(wear_location, item) {
    util.log(">> Equipping at ", wear_location, item.getUuid);

    self.equipment[wear_location] = item.getUuid();

    item.setEquipped(true);
  };

  /**
   * "unequip" an item
   * @param Item   item
   */
  self.unequip = function(item) {
    item.setEquipped(false);
    for (var i in self.equipment) {
      if (self.equipment[i] === item.getUuid()) {
        delete self.equipment[i];
        break;
      }
    }
    item.emit('remove', self);
  };

  /**
   * Write to a player's socket
   * @param string data Stuff to write
   */
  self.write = function(data, color) {
    color = color || true;

    if (!color) ansi.disable();
    socket.write(ansi.parse(data));
    ansi.enable();
  };

  /**
   * Write based on player's locale
   * @param Localize l10n
   * @param string   key
   * @param ...
   */
  self.writeL10n = function(l10n, key) {
    var locale = l10n.locale;
    if (self.getLocale()) {
      l10n.setLocale(self.getLocale());
    }

    self.write(l10n.translate.apply(null, [].slice.call(arguments)
      .slice(1)));

    if (locale) l10n.setLocale(locale);
  };

  /**
   * write() + newline
   * @see self.write
   */
  self.say = function(data, color) {
    color = color || true;
    if (!color) ansi.disable();
    socket.write(ansi.parse(wrap(data), 40) + "\r\n");
    ansi.enable();
  };

  /**
   * writeL10n() + newline
   * @see self.writeL10n
   */
  self.sayL10n = function(l10n, key) {
    var locale = l10n.locale;
    if (self.getLocale()) {
      l10n.setLocale(self.getLocale());
    }

    self.say(wrap(l10n.translate.apply(null, [].slice.call(arguments)
      .slice(1))));
    if (locale) l10n.setLocale(locale);
  };

  /**
   * Display the configured prompt to the player
   * @param object extra Other data to show
   */
  self.prompt = function(extra) {
    var pstring = self.getPrompt();
    extra = extra || {};

    extra.health_condition = statusUtil.getHealthText(self.getAttribute(
      'max_health'), self)(self.getAttribute('health'));
    extra.sanity_condition = statusUtil.getSanityText(self.getAttribute(
      'max_sanity'), self)(self.getAttribute('sanity'));

    for (var data in extra) {
      pstring = pstring.replace("%" + data, extra[data]);
    }

    pstring = pstring.replace(/%[a-z_]+?/, '');
    self.write("\r\n" + pstring);
  };

  /**
   * @see self.prompt
   */
  self.combatPrompt = function(extra) {
    extra = extra || {};

    var pstring = self.getCombatPrompt();

    for (var data in extra) {
      pstring = pstring.replace("%" + data, extra[data]);
    }

    pstring = pstring.replace(/%[a-z_]+?/, '');
    self.write("\r\n" + pstring);
  };


  /**
   * Not really a "load" as much as a constructor but we really need any
   * of this stuff when we create a player, so make a separate method for it
   * @param object data Object should have all the things a player needs. Like spinach.
   */
  self.load = function(data) {
    self.name = data.name;
    self.location = data.location;
    self.locale = data.locale;
    self.prompt_string = data.prompt_string;
    self.password = data.password;
    self.inventory = data.inventory || [];
    self.equipment = data.equipment || {};
    self.attributes = data.attributes;
    self.skills = data.skills;
    self.preferences = data.preferences || {};
    self.explored = data.explored || [];

    // Activate any passive skills the player has
    for (var skill in self.skills) {
      if (Skills[self.getAttribute('class')][skill].type === 'passive') {
        self.useSkill(skill, self);
      }
    }

  };

  /**
   * Save the player... who'da thunk it.
   * @param function callback
   */
  self.save = function(callback) {
    Data.savePlayer(self, callback);
  };

  /**
   * Get attack speed of a player
   * @return float
   */
  self.getAttackSpeed = function() {
    var weapon = self.getEquipped('wield', true);
    var minimum = 100;

    var speedFactor = weapon ? weapon.getAttribute('speed') || 2 : 2;
    var speedDice = (self.getAttribute('quickness') + self.getAttribute(
      'cleverness'));

    var speed = Math.max(5000 - roll(speedDice, 100 / speedFactor), minimum);
    util.log("Player's speed is ", speed);

    if (self.checkStance('precise')) speed = Math.round(speed * 1.5);

    return speed;
  };

  function roll(dice, sides) {
    return dice * (Math.floor(sides * Math.random()) + 1);
  }

  /**
   * Get the damage a player can do
   * @return int
   */
  self.getDamage = function() {
    var weapon = self.getEquipped('wield', true)
    var base = [1, self.getAttribute('stamina') + 1];

    var damage = weapon ?
      (weapon.getAttribute('damage') ?
        weapon.getAttribute('damage')
        .split('-')
        .map(function(i) {
          return parseInt(i, 10);
        }) : base
      ) : base;

    damage = damage.map(d => d + addDamageBonus(d));

    return { min: damage[0], max: damage[1] };
  };

  function addDamageBonus(d) {
    var stance = self.getPreference('stance');
    var bonuses = {
      'berserk': self.getAttribute('stamina') * self.getAttribute('quickness'),
      'cautious': -(Math.round(d / 2)),
      'precise': 1
    }
    return bonuses[stance] || 0;
  }

  /**
   * Turn the player into a JSON string for storage
   * @return string
   */
  self.stringify = function() {
    var inv = [];

    self.getInventory()
      .forEach(function(item) {
        inv.push(item.flatten());
      });

    return JSON.stringify({
      name: self.name,
      location: self.location,
      locale: self.locale,
      prompt_string: self.prompt_string,
      combat_prompt: self.combat_prompt,
      password: self.password,
      inventory: inv,
      equipment: self.equipment,
      attributes: self.attributes,
      skills: self.skills,
      gender: self.gender,
      preferences: self.preferences,
      explored: self.explored
    });
  };

  /**
   * Players will have some defined events so load them on creation
   */
  self.init = function() {
    Data.loadListeners({ script: "player.js" }, l10n_dir, npcs_scripts_dir,
      self);
  };

  /**
   * Helper to activate skills
   * @param string skill
   */
  self.useSkill = function(skill /*, args... */ ) {
    Skills[skill].activate.apply(null, [].slice
      .call(arguments)
      .slice(1));
  };

  /**
   * Helper to calculate physical damage
   * @param int damage
   * @param string location
   */
  self.damage = function(dmg, location) {
    if (!dmg) return;
    location = location || 'body';

    damageDone = Math.max(1, dmg - soak(location));

    self.setAttribute('health',
      Math.max(0, self.getAttribute('health') - damageDone));

    util.log('Damage done to ' + self.getName() + ': ' + damageDone);

    return damageDone;
  };

  function soak(location) {
    var defense = armor(location);

    if (location !== 'body')
      defense += armor('body');

    defense += self.getAttribute('stamina');

    if (self.checkStance('cautious')) defense += self.getAttribute('cleverness');
    if (self.checkStance('berserk')) defense = Math.round(defense / 2);

    util.log(self.getName() + ' ' + location + ' def: ' + defense);

    return defense;
  }

  function armor(location) {
    var bonus = self.checkStance('precise') ? self.getAttribute('willpower') + self.getAttribute('stamina') : 0
    var item = self.getEquipped(location, true);
    if (item)
      return item.getAttribute('defense') * bonus;
    return 0;
  }

  self.init();
};

util.inherits(Player, events.EventEmitter);

// Export the Player class so you can use it in
// other files by using require("Player").Player
exports.Player = Player;
