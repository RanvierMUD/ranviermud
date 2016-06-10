'use strict';
const Data = require('./data')
  .Data,
  Skills = require('./skills')
  .Skills,
  crypto = require('crypto'),
  ansi = require('sty'),
  util = require('util'),
  events = require('events'),
  wrap = require('wrap-ansi'),
  Random = require('./random').Random,
  Feats = require('./feats').Feats;

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
    '%health_condition <blue>||</blue> %sanity_condition\n<blue><bold>[</bold></blue>';
  self.combat_prompt =
    "<bold>|| %player_condition <blue>||</blue> %target_condition ||</bold>\r\n>";
  self.password = null;
  self.inventory = [];
  self.equipment = {};

  // In combat is either false or an NPC vnum
  self.inCombat = false;

  // Attributes
  self.attributes = {

    max_health: 100,
    health: 90,
    max_sanity: 100,
    sanity: 70,

    stamina: 1,
    willpower: 1,
    quickness: 1,
    cleverness: 1,

    level: 1,
    experience: 0,
    mutagens: 0,
    attrPoints: 0,

    //TODO: Generated descs.
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

  // Feats the player can use
  self.feats = {};

  // Training data
  self.training = { time: 0 };

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
  self.getGender = () => self.gender;

  self.getAttribute = attr => typeof self.attributes[attr] !== 'undefined' ?
    self.attributes[attr] : false;

  self.getPreference = pref => typeof self.preferences[pref] !== 'undefined' ?
    self.preferences[pref] : false;

  self.getSkills = skill => typeof self.skills[skill] !== 'undefined' ?
    self.skills[skill] : self.skills;

  self.setSkill = (skill, level) => self.skills[skill] = level;
  self.incrementSkill = skill => self.setSkill(skill, self.skills[skill] + 1);

  self.getFeats = feat => self.feats && typeof self.feats[feat] !== 'undefined' ?
    self.feats[feat] : self.feats;

  self.gainFeat = feat => self.feats[feat.id] = feat;

  self.getPassword = () => self.password; // Returns hash.
  self.isInCombat = () => self.inCombat;

  self.setPrompt = str => self.prompt_string = str;
  self.setCombatPrompt = str => self.combat_prompt = str;
  self.setLocale = locale => self.locale = locale;
  self.setName = newname => self.name = newname;
  self.setDescription = newdesc =>
    self.attributes.description =
      newdesc;

  self.setLocation = loc => self.location = loc;
  self.setPassword = pass =>
    self.password = crypto
      .createHash('md5')
      .update(pass)
      .digest('hex');

  self.setGender = gender => self.gender = gender.toUpperCase();
  self.addItem = item => self.inventory.push(item);
  self.removeItem = item => {
    self.inventory = self.inventory.filter(i => item !== i);
  };
  self.setInventory = inv => self.inventory = inv;
  self.setInCombat = combatant => self.inCombat = combatant;
  self.setAttribute = (attr, val) => self.attributes[attr] = val;
  self.setPreference = (pref, val) => self.preferences[pref] = val;
  self.addSkill = (name, skill) => self.skills[name] = skill;

  // Used to set up skill training business.
  self.setTraining = (key, value) => self.training[key] = value;
  self.getTraining = key => key ? self.training[key] : self.training || {};

  self.checkTraining = () => {
    const beginning = self.training.beginTraining;

    if (!beginning) { return; }

    let queuedTraining = [];
    for (const queued in self.training) {
      if (queued !== 'time' && queued !== 'beginTraining') {
        queuedTraining.push(self.training[queued]);
        util.log(queuedTraining);
      }
    }

    if (!queuedTraining.length) { return; }
    queuedTraining.sort((x, y) => x.cost - y.cost);

    let trainingTime = Date.now() - beginning;

    player.say("");

    for (let i = 0; i < queuedTraining.length; i++) {
      let session = queuedTraining[i];

      if (trainingTime >= session.duration) {
        trainingTime -= session.duration;

        self.setSkill(session.id, session.newLevel);
        self.say('<bold>' + session.message + '</bold>');
        delete self.training[session.id];

      } else {
        delete self.training[session.id];
        self.say(
          '<bold><yellow>You were able to spend some time training ' +
          session.skill +
          ', but did not make any breakthroughs.</yellow></bold>'
        );

        session.duration -= trainingTime;
        self.setTraining(session.id, session);

        break;
      }
    }

    delete self.training.beginTraining;
    self.say('<bold>Thus completes your training, for now.</bold>');
  };

  self.clearTraining = () => {
    for (const queued in self.training) {
      if (queued !== 'time' && queued !== 'beginTraining') {
        const session = self.training[queued];
        const time = self.getTraining('time');
        self.setTraining('time', time + session.newLevel);
        delete self.training[queued];
      }
    }

    if (self.training.beginTraining) {
      delete self.training.beginTraining;
    }

    player.say('You decide to change your training regimen.');
  };

  self.checkStance = stance => self.preferences.stance === stance.toLowerCase();
  /**#@-*/


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

    //TODO: Consider using Random.roll instead.
    let chance = (Math.random() * bonus);
    let spotted = (self.getAttribute('cleverness') + chance >= difficulty);

    util.log("Spot check success: ", spotted);
    return spotted;
  }

  /**
   * Get currently applied effects
   * @param string eff
   * @return Array|Object
   */
  self.getEffects = eff => {
    if (eff) {
      return typeof self.effects[eff] !== 'undefined' ? self.effects[eff] :
        false;
    }
    return self.effects;
  };

  /**
   * Add, activate and set a timer for an effect
   * @param string name
   * @param object effect
   */
  self.addEffect = (name, effect) => {
    if (effect.activate) {
      effect.activate();
    }

    let deact = function() {
      if (effect.deactivate && self.getSocket()) {
        effect.deactivate();
        // self.prompt();
      }
      self.removeEffect(name);
    };

    if (effect.duration) {
      effect.timer = setTimeout(deact, effect.duration);
    } else if (effect.event) {
      self.on(effect.event, deact);
    }
    self.effects[name] = effect;
  };

  self.removeEffect = eff => {
    if (self.effects[eff].event) {
      self.removeListener(self.effects[eff].event, self.effects[eff].deactivate);
    } else {
      clearTimeout(self.effects[eff].timer);
    }
    self.effects[eff] = null;
  };

  /**
   * Get and possibly hydrate an equipped item
   * @param string  slot    Slot the item is equipped in
   * @param boolean hydrate Return an actual item or just the uuid
   * @return string|Item
   */
  self.getEquipped = (slot, hydrate) => {
    if (!slot) {
      return self.equipment;
    }

    if (!(slot in self.equipment)) {
      return false;
    }

    hydrate = hydrate || false;
    if (hydrate) {
      return self.getInventory()
        .filter(i => i.getUuid() === self.equipment[slot])[0];
    }
    return self.equipment[slot];
  };

  /**
   * "equip" an item
   * @param string wearLocation The location this item is worn
   * @param Item   item
   */
  self.equip = (wearLocation, item) => {
    self.equipment[wearLocation] = item.getUuid();
    item.setEquipped(true);
  };

  /**
   * "unequip" an item
   * @param Item   item
   */
  self.unequip = item => {
    item.setEquipped(false);
    for (var i in self.equipment) {
      if (self.equipment[slot] === item.getUuid()) {
        self.equipment[slot] = null;
        break;
      }
    }
    item.emit('remove', self);
  };

  /**
   * Write to a player's socket
   * @param string data Stuff to write
   */
  self.write = (data, color) => {
    color = color || true;
    if (!color) ansi.disable();
    socket.write(ansi.parse(data));
    ansi.enable();
  };

  /**
   * Write based on player's locale
   * @param Localize l10n
   * @param string   key
   */
  self.writeL10n = function (l10n, key) {
    let locale = l10n.locale;
    if (self.getLocale()) {
      l10n.setLocale(self.getLocale());
    }

    self.write(l10n.translate.apply(null, [].slice.call(arguments).slice(1)));

    if (locale) l10n.setLocale(locale);
  };

  /**
   * write() + newline
   * @see self.write
   */
  self.say = (data, color) => {
    color = color || true;
    if (!color) ansi.disable();
    socket.write(ansi.parse(wrap(data), 40) + "\r\n");
    ansi.enable();
  };

  /**
   * writeL10n() + newline
   * @see self.writeL10n
   */
  self.sayL10n = function (l10n, key) {
    let locale = l10n.locale;
    if (self.getLocale()) {
      l10n.setLocale(self.getLocale());
    }

    let translated = l10n.translate.apply(null, [].slice.call(arguments).slice(1));
    self.say(translated, true);
    if (locale) l10n.setLocale(locale);
  };

  /**
   * Display the configured prompt to the player
   * @param object extra Other data to show
   */
  self.prompt = extra => {
    let pstring = self.getPrompt();
    extra = extra || {};

    extra.health_condition = statusUtil.getHealthText(self.getAttribute(
      'max_health'), self)(self.getAttribute('health'));
    extra.sanity_condition = statusUtil.getSanityText(self.getAttribute(
      'max_sanity'), self)(self.getAttribute('sanity'));

    for (let data in extra) {
      pstring = pstring.replace("%" + data, extra[data]);
    }

    pstring = pstring.replace(/%[a-z_]+?/, '');
    self.write("\r\n" + pstring);
  };

  /**
   * @see self.prompt
   */
  self.combatPrompt = extra => {
    extra = extra || {};

    let pstring = self.getCombatPrompt();

    for (let data in extra) {
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
  self.load = data => {
    self.name = data.name;
    self.location = data.location;
    self.locale = data.locale;
    self.prompt_string = data.prompt_string;
    self.password = data.password;
    self.inventory = data.inventory || [];
    self.equipment = data.equipment || {};
    self.attributes = data.attributes;
    self.skills = data.skills;
    self.feats = data.feats || {};
    self.preferences = data.preferences || {};
    self.explored = data.explored || [];
    self.training = data.training || { time: 0 };

    // Activate any passive skills the player has
    //TODO: Probably a better way to do this than toLowerCase.
    for (let feat in self.feats) {
      feat = feat.toLowerCase();
      let featType = Feats[feat].type;
      if (featType === 'passive') {
        self.useFeat(feat, self);
      }
    }

    // If the player is new, or skills have been added, initialize them to level 1.
    for (let skill in Skills) {
      skill = Skills[skill];
      if (!self.skills[skill.id]) {
        util.log("Initializing skill ", skill.id);
        self.skills[skill.id] = 1;
      }
    }

  };

  /**
   * Save the player... who'da thunk it.
   * @param function callback
   */
  self.save = callback => {
    Data.savePlayer(self, callback);
  };

  /**
   * Get attack speed of a player
   * @return float milliseconds between attacks
   */
  self.getAttackSpeed = () => {
    let weapon = self.getEquipped('wield', true);
    let minimum = 100;

    let speedFactor = weapon ? weapon.getAttribute('speed') || 2 : 2;
    let speedDice = (self.getAttribute('quickness') + self.getAttribute(
      'cleverness'));

    let speedRoll = 5000 - Random.roll(speedDice, 100 / speedFactor);

    let speed = Math.max(speedRoll, minimum);
    util.log("Player's speed is ", speed);

    if (self.checkStance('precise')) speed = Math.round(speed * 1.5);
    if (self.checkStance('berserk')) speed = Math.round(speed * .75);

    return speed;
  };



  /**
   * Get the damage a player can do
   * @return int
   */
  self.getDamage = () => {
    let weapon = self.getEquipped('wield', true)
    let base = [1, self.getAttribute('stamina') + 1];

    let damage = weapon ?
      (weapon.getAttribute('damage') ?
        weapon.getAttribute('damage')
        .split('-')
        .map(dmg => {
          return parseInt(dmg, 10);
        }) : base
      ) : base;

    damage = damage.map(dmg => dmg + addDamageBonus(dmg));

    return { min: damage[0], max: damage[1] };
  };

  function addDamageBonus(d) {
    let stance = self.getPreference('stance');
    let bonuses = {
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
  self.stringify = () => {
    let inv = [];

    self.getInventory()
      .forEach(item => {
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
      feats: self.feats,
      gender: self.gender,
      preferences: self.preferences,
      explored: self.explored,
      training: self.training,
    });
  };

  /**
   * Players will have some defined events so load them on creation
   */
  self.init = () => {
    Data.loadListeners({ script: "player.js" }, l10n_dir, npcs_scripts_dir,
      self);
  };

  /**
   * Helpers to activate skills or feats
   * @param string skill/feat
   * @param [string] arguments
   * Command event passes in player, args, rooms, npcs.
   */
  self.useSkill = function (skill /*, args... */ ) {
    if (!Skills[skill]) {
      util.log("skill not found: ", skill);
      return;
    }
    const args = [].slice.call(arguments).slice(1)
    Skills[skill].activate.apply(null, args);
  };

  self.useFeat = function (feat /*, args... */ ) {
    if (!Feats[feat.toLowerCase()]) {
      util.log("feat not found: ", feat);
      return;
    }
    const args = [].slice.call(arguments).slice(1)
    Feats[feat].activate.apply(null, args);
  };



  /**
   * Helper to calculate physical damage
   * @param int damage
   * @param string location
   */
  self.damage = (dmg, location) => {
    if (!dmg) return;
    location = location || 'body';

    let damageDone = Math.max(1, dmg - soak(location));

    self.setAttribute('health',
      Math.max(0, self.getAttribute('health') - damageDone));

    util.log('Damage done to ' + self.getName() + ': ' + damageDone);

    return damageDone;
  };

  function soak(location) {
    let defense = armor(location);

    if (location !== 'body')
      defense += armor('body');

    defense += self.getAttribute('stamina');

    if (self.checkStance('cautious')) defense += self.getAttribute('cleverness');
    if (self.checkStance('berserk')) defense = Math.round(defense / 2);

    util.log(self.getName() + ' ' + location + ' def: ' + defense);

    return defense;
  }

  function armor(location) {
    let bonus = self.checkStance('precise') ? self.getAttribute('willpower') + self.getAttribute('stamina') : 0
    let item = self.getEquipped(location, true);
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
