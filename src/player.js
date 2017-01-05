'use strict';
const Data = require('./data').Data,
  Skills   = require('./skills').Skills,
  crypto   = require('crypto'),
  ansi     = require('sty'),
  util     = require('util'),
  events   = require('events'),
  wrap     = require('wrap-ansi'),
  Random   = require('./random').Random,
  Effects  = require('./effects').Effects,
  Effect   = require('./effect').Effect,
  _        = require('./helpers');

const npcs_scripts_dir = __dirname + '/../scripts/player/';
const l10n_dir         = __dirname + '/../l10n/scripts/player/';
const CombatUtil       = require('./combat_util').CombatUtil;
const CommandUtil      = require('./command_util').CommandUtil;
const ItemUtil         = require('./item_util').ItemUtil;

const Player = function PlayerConstructor(socket) {
  const self = this;

  self.name        = '';
  self.description = 'A person';
  self.location    = null;
  self.locale      = null;
  self.accountName = '';

  self.prompt_string = '[ %health/%max_health <bold>hp</bold> -- %energy/%max_energy <bold>energy</bold> ]';
  self.combat_prompt = '[ %health/%max_health <bold>hp</bold> -- %energy/%max_energy <bold>energy</bold> ]';

  self.password  = null;
  self.inventory = [];
  self.equipment = {};

  // Array of combatants
  self.inCombat  = [];

  // Attributes
  self.attributes = {

    max_health: 100,
    health:     90,
    max_energy: 100,
    energy:     90,

    strength:     20,
    intelligence: 20,
    wisdom:       20,
    dexterity:    20,
    constitution: 20,

    level:      1,
    experience: 0,
  };

  self.preferences = {
    target:    'body',
    wimpy:     30,
    roomdescs: 'default' //default = verbose 1st time, short after.
  };

  self.explored = [];
  self.killed   = { length: 0 };

  // Anything affecting the player
  self.effects = new Map();

  // Skills the players has
  self.skills = {};

  self.bodyParts = [
    'legs',
    'feet',
    'torso',
    'hands',
    'head'
  ];

  /**#@+
   * Mutators
   */
  self.getPrompt       = () => self.prompt_string;
  self.getCombatPrompt = () => self.combat_prompt;
  self.getLocale       = () => self.locale;
  self.getName         = () => self.name;
  self.getShortDesc    = () => self.name;
  self.getAccountName  = () => self.accountName;
  self.getDescription  = () => self.description;
  self.getLocation     = () => self.location;
  self.getBodyParts    = () => self.bodyParts;
  self.getSocket       = () => socket;
  self.getInventory    = () => self.inventory;
  self.getAttributes   = () => self.attributes || {};
  self.getGender       = () => self.gender;
  self.getRoom         = rooms => rooms ? rooms.getAt(self.getLocation()) : null;

  self.getAttribute = attr => typeof self.attributes[attr] !== 'undefined' ?
    Effects.evaluateAttrMods(self, attr) : false;

  self.getRawAttribute = attr => typeof self.attributes[attr] !== 'undefined' ?
    self.attributes[attr] : self.attributes;

  self.getPreference = pref => typeof self.preferences[pref] !== 'undefined' ?
    self.preferences[pref] : false;

  self.getPreferences = () => self.preferences;

  self.getPassword = () => self.password; // Returns hash.

  self.setPrompt       = str => self.prompt_string = str;
  self.setCombatPrompt = str => self.combat_prompt = str;
  self.setLocale       = locale => self.locale = locale;
  self.setName         = newname => self.name = newname;
  self.setAccountName  = accname => self.accountName = accname;
  self.setDescription  = newdesc => self.description = newdesc;

  self.setLocation = loc  => self.location = loc;
  self.setPassword = pass =>
    self.password  = crypto
      .createHash('md5')
      .update(pass)
      .digest('hex');

  self.setGender   = gender => self.gender = gender.toUpperCase();

  self.addItem      = item   => self.inventory.push(item);
  self.removeItem   = item   => self.inventory = self.inventory.filter(i => item !== i);
  self.setInventory = inv    => self.inventory = inv;

  self.setAttribute     = (attr, val) => self.attributes[attr]  = val;
  self.setPreference    = (pref, val) => self.preferences[pref] = val;

  self.isInCombat       = ()          => self.inCombat.length > 0;
  self.fleeFromCombat   = ()          => self.inCombat = [];
  self.setInCombat      = combatant   => self.inCombat.push(combatant);
  self.getInCombat      = ()          => self.inCombat;
  self.removeFromCombat = combatant   =>
  self.inCombat = self.inCombat.filter(comb => combatant !== comb);

  ///// ----- Skills and Training. ----- ///////

  self.getSkills = skill => self.skills[skill] ?  parseInt(self.skills[skill], 10) : self.skills;
  self.setSkill = (skill, level) => self.skills[skill] = level;

  /**#@-*/

  ///// ----- Handle Effects. ----- ///////


  /**
   * Get currently applied effects
   * @param string effect id
   * @return Map effects
   */
  self.getEffects = id => id ? self.effects.get(id) : self.effects;

  /**
   * Add & activate an effect
   * @param string name
   * @param object effect
   */
  self.addEffect = (id, options) => {
    const effect = new Effect({
      id,
      options,
      type: options.type,
      target: self
    });

    self.removeEffect(id);
    self.effects.set(id, effect);
    effect.init();
  };

  self.removeEffect = id => {
    if (self.effects.has(id)) {
      const oldEffect = self.effects.get(id);
      oldEffect.deactivate();
      return self.effects.delete(id);
    }
  }

  ///// ----- Handle Inventory && Equipment. ----- ///////

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
    const uid = item.getUuid();

    ItemUtil.deleteFromEquipment(self, item, wearLocation);

    self.equipment[wearLocation] = uid;
    util.log(`${self.getName()} is EQUIPPING ${item.getShortDesc()} at ${wearLocation}.`);
    item.setEquipped(true);
  };

  /**
   * "unequip" an item
   * @param Item   item
   * @return String slot it was equipped in (see remove commmand)
   */
  self.unequip = (item, items, players, isDropping) => {
    const holdingLocation = self.canHold(item) && !isDropping ? self.findHoldingLocation() : null;
    const itemName        = item.getShortDesc();
    const size            = item.getAttribute('size');
    const container       = self.getContainersWithCapacity(items, size)
                                .filter(cont => cont !== item)[0];

    if (!isDropping) {
      const success = handleNormalUnequip(item, container, players, holdingLocation);
      if (!success) { return false; }
    } else {
      item.setEquipped(false);
    }

    ItemUtil.deleteFromEquipment(self, item, holdingLocation);
    return true;
  };

  function handleNormalUnequip(item, container, players, holdingLocation) {
    if (container) {
      return ItemUtil.putItemInContainer(item, container, self, players);
    } else if (holdingLocation) {
      return ItemUtil.holdOntoItem(item, holdingLocation, self, players);
    } else {
      return self.warn(`Your hands are full. You will have to put away or drop something you are holding.`);
    }
  }

  self.findHoldingLocation = () => {
    const equipment = self.getEquipped();
    return equipment['held'] ? 'offhand held' : 'held';
  }

  self.isHolding = item => {
    const equipped = self.getEquipped();
    return ['wield', 'offhand', 'held', 'offhand held'].some(slot => equipped[slot] === item.getUuid());
  }

  self.canHold = item => {
    const equipped     = self.getEquipped();
    const holdingSpots = ['wield', 'offhand', 'held', 'offhand held'];

    // The spot is open if there is nothing in it or if the item they are trying to wield is already being held...
    const openSpots = holdingSpots.filter(slot => !equipped[slot] || (item ?
        equipped[slot] === item.getUuid() :
        true));
    return holdingSpots.length > 2;
  };

  /**
   *  @param Number size
   *  @return a list of all containers with capacity greater than size.
   */
  self.getContainersWithCapacity = (items, size) => self.inventory
      .filter(item => item.isContainer() && item.getRemainingSizeCapacity(items) >= size);

  self.getContainerWithCapacity = (items, size) => self.getContainersWithCapacity(items, size)[0];


  ///// ----- Communicate with the player. ----- ///////

  /**
   * Write to a player's socket
   * @param string data Stuff to write
   */
  self.write = (data, color) => {
    if (!socket.writable) {
        return;
    }

    color = typeof color === 'boolean' ? color : true;
    if (!color) { ansi.disable(); }
    socket.write(ansi.parse(data));
    ansi.enable();
  };

  /**
   * Write based on player's locale -- DEPRECATED
   * @param Localize l10n
   * @param string   key
   */

  self.writeL10n = __deprecatedWrite;

  function __deprecatedWrite(l10n, key) {
    let locale = l10n.locale;
    if (self.getLocale()) {
      l10n.setLocale(self.getLocale());
    }

    self.write(l10n.translate.apply(null, [].slice.call(arguments).slice(1)));

    if (locale) { l10n.setLocale(locale); }
  }

  /**
   * write() + newline
   * @see self.write
   */
  self.say = (data, color) => {
    const noColor = color === false;
    if (noColor) { ansi.disable(); }
    socket.write(ansi.parse(wrap(data), 40) + "\r\n");
    ansi.enable();
  };

  self.warn = data => self.say('<yellow>' + data + '</yellow>');

  /**
   * writeL10n() + newline
   * @see self.writeL10n
   */
  self.sayL10n = __deprecatedSay;

  function __deprecatedSay(l10n, key) {
    let locale = l10n.locale;
    if (self.getLocale()) {
      l10n.setLocale(self.getLocale());
    }

    let translated = l10n.translate.apply(null, [].slice.call(arguments).slice(1));
    self.say(translated, true);
    if (locale) { l10n.setLocale(locale); }
  }


  ///// ----- Prompts: ----- ///////

  /**
   * Display the configured prompt to the player
   * @param object extra Other data to show
   */
  //TODO: refactor to use template strings.
  self.prompt = extra => {
    let pstring = self.getPrompt();
    extra = extra || {};

    for (let data in extra) {
      pstring = pstring.replace("%" + data, extra[data]);
    }

    const attrs = self.getAttributes();
    for (let attr in attrs) {
      pstring = pstring.replace("%" + attr, attrs[attr]);
    }

    pstring = pstring.replace(/%[a-z_]+/, '');
    self.write("\r\n" + pstring);
  };

  /**
   * @see self.prompt
   */
  self.combatPrompt = extra => {
    let pstring = self.getCombatPrompt();
    extra = extra || {};

    for (let data in extra) {
      pstring = pstring.replace("%" + data, extra[data]);
    }

    const attrs = self.getAttributes();
    for (let attr in attrs) {
      pstring = pstring.replace("%" + attr, attrs[attr]);
    }

    pstring = pstring.replace(/%[a-z_]+/, '');
    self.write("\r\n" + pstring);
  };

  ///// ----- Set up us the data. ----- ///////

  /**
   * Not really a "load" as much as a constructor but we really need any
   * of this stuff when we create a player, so make a separate method for it
   * @param object data Object should have all the things a player needs. Like spinach.
   */
  self.load = data => {

   self.name = data.name;
   self.accountName = data.accountName;
   self.password = data.password;

   self.location = data.location;
   self.locale = data.locale;

   self.description = data.description;

   self.bodyParts = data.bodyParts || {};
   self.inventory = data.inventory || [];
   self.equipment = data.equipment || {};
   self.prompt_string = data.prompt_string || '';
   self.combat_prompt = data.combat_prompt || '';
   self.attributes = data.attributes   || {};
   self.skills = data.skills           || {};
   self.preferences = data.preferences || {};

    // If the player is new, or skills have been added, initialize them to level 1.
    // FIXME: This seems to give every player every skill, no bueno
    for (let skill in Skills) {
      skill = Skills[skill];
      if (!self.skills[skill.id]) {

        util.log("Initializing skill ", skill.id);
        self.skills[skill.id] = 1;
      }
    }

    // Hydrate and activate any effects
    self.effects = Data.loadEffects(self, data.effects);

  };

  /**
   * Save the player... who'da thunk it.
   * @param function callback
   */
  self.save = callback => {
    Data.savePlayer(self, callback);
  };

  /*
   * Gets a suite of combat helper functions.
   * getAttackSpeed, getDamage, damage, etc.
   */
  self.combat = CombatUtil.getHelper(self);

  /**
   * Turn the player into a JSON string for storage
   * @return string
   */
  self.stringify = () => {
    const inventory = self
      .getInventory()
      .map(item => item.flatten());

    const effects = Effects.stringify(self);

    const {
      name, accountName, location, locale,
      prompt_string, combat_prompt, password,
      equipment, attributes, skills,
      gender, preferences, bodyParts, description
    } = self;

    return JSON.stringify({
      name,           accountName,
      location,       locale,
      prompt_string,  combat_prompt,
      password,       equipment,
      attributes,     skills,
      gender,         preferences,
      bodyParts,      effects,
      inventory,       description
    });
  };


  /**
   * Helpers to activate skills
   * @param string skill/feat
   * @param [string] arguments
   * Command event passes in player, args, rooms, npcs.
   */
  self.useSkill = (skill, ...args) => {
    if (!Skills[skill]) { return util.log("ERROR: Skill not found: ", skill); }
    Skills[skill].activate(...args);
  };

  /**
   * Helper to calculate physical damage
   * @param int damage
   * @param string location
   */
  self.damage = (dmg, location) => {
    if (!dmg) { return 0; }
    location = location || 'body';

    //TODO: Put this as a function in the combatUtils module.
    const damageDone = Math.max(1, dmg - self.combat.soak(location));

    self.setAttribute('health',
      Math.max(0, self.getAttribute('health') - damageDone));

    util.log('Damage done to ' + self.getName() + ': ' + damageDone);

    return damageDone;
  };

  /**
   * Players will have some defined events so load them on creation
   */
  self._init = () =>
    Data.loadListeners(
      { script: "player.js" },
      l10n_dir,
      npcs_scripts_dir,
      self);

  self._init();
};

util.inherits(Player, events.EventEmitter);

exports.Player = Player;
