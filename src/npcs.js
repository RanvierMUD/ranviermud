'use strict';
const fs = require('fs'),
  util = require('util'),
  uuid = require('node-uuid'),
  events = require('events'),
  Data = require('./data.js').Data;

const npcs_dir = __dirname + '/../entities/npcs/';
const npcs_scripts_dir = __dirname + '/../scripts/npcs/';
const l10n_dir = __dirname + '/../l10n/scripts/npcs/';

/**
 * Npc container class. Loads/finds npcs
 */
const Npcs = function NpcManager() {
  const self = this;
  self.npcs = {};
  self.load_count = {};

  /**
   * Load NPCs from the configs
   * @param boolean verbose Whether to do verbose logging
   * @param callback
   */
  self.load = (verbose, callback) => {
    verbose = verbose || false;
		const log = (message) => { if (verbose) util.log(message); };
		const debug = (message) => { if (verbose) util.debug(message); };

		log("\tExamining npc directory - " + npcs_dir);
		const npcs = fs.readdir(npcs_dir, (err, files) =>
    {
			// Load any npc files
			for (const j in files) {
				const npc_file = npcs_dir + files[j];
				if (!fs.statSync(npc_file).isFile()) continue;
				if (!npc_file.match(/yml$/)) continue;

        let npc_def;
				// parse the npc files
				try {
          npc_def = require('js-yaml').load(fs.readFileSync(npc_file).toString('utf8'));
				} catch (e) {
					log("\t\tError loading npc - " + npc_file + ' - ' + e.message);
					continue;
				}

				// create and load the npcs
				npc_def.forEach(npc => {
					const validate = ['keywords', 'short_description', 'vnum'];

					let err = false;
					for (var v in validate) {
						if (!(validate[v] in npc)) {
							log("\t\tError loading npc in file " + npc + ' - no ' + validate[v] + ' specified');
							err = true;
							return;
						}
					}

          const hitMaxLoad = self.load_count[npc.vnum] && self.load_count[npc.vnum] >= npc.load_max
					if (hitMaxLoad) {
						log("\t\tMaxload of " + npc.load_max + " hit for npc " + npc.vnum);
						return;
					}

					npc = new Npc(npc);
					npc.setUuid(uuid.v4());
					log("\t\tLoaded npc [uuid:" + npc.getUuid() + ', vnum:' + npc.vnum + ']');
					self.add(npc);
				});
			}

			if (callback) { callback(); }
		});
  };

  /**
   * Add an npc and generate a uuid if necessary
   * @param Npc npc
   */
  self.add = npc => {
    if (!npc.getUuid()) {
      npc.setUuid(uuid.v4());
    }
    self.npcs[npc.getUuid()] = npc;
    self.load_count[npc.vnum] = self.load_count[npc.vnum] ? self.load_count[npc.vnum] + 1 : 1;
  };

  /**
   * Gets all instance of an npc
   * Not sure exactly what you'd use this method for as you would most likely
   * rather act upon a single instance of an item
   * @param int vnum
   * @return Npc
   */
  self.getByVnum = vnum => self.npcs.filter(npc => npc.getVnum() === vnum);

  /**
   * retreive an instance of an npc by uuid
   * @param string uid
   * @return Npc
   */
  self.get = uid => self.npcs[uid];

  /**
   * proxy Array.each
   * @param function callback
   */
  self.each = callback => {
    for (const npc in self.npcs) {
      callback(self.npcs[npc]);
    }
  };

  /**
   * Blows away an NPC
   * WARNING: If you haven't removed the npc from the room it's in shit _will_ break
   * @param Npc npc
   */
  self.destroy = npc => {
    delete self.npcs[npc.getUuid()];
    npc = null;
  };
}

/**
 * Actual class for NPCs
 */
const Npc = function NpcConstructor(config) {
  const self = this;

  self.keywords;
  self.short_description;
  self.attack;
  self.description;
  self.room; // Vnum of current location
  self.vnum;
  self.inCombat = false;
  self.uuid = null;

  self.attributes = {
    max_health: 0,
    health: 0,
    level: 1
  };

  self.effects = {};

  /**
   * tha real constructor
   * @param object config
   */
  self.init = function (config) {
    self.short_description = config.short_description || '';
    self.keywords = config.keywords || [];
    self.attack = config.attack || { en: 'strike' };
    self.description = config.description || '';
    self.room = config.room || null;
    self.vnum = config.vnum;
    self.types = config.types || [];
    self.defenses = {};

    for (const stat in config.attributes || {}) {
      self.attributes[stat] = config.attributes[stat];
    }

    for (const armor in config.defenses || {}) {
      self.defenses[armor] = config.defenses[armor];
    }

    Data.loadListeners(config, l10n_dir, npcs_scripts_dir, Data.loadBehaviors(config, 'npcs/', self));
  };

  /**#@+
   * Mutators
   */
  self.getVnum = () => self.vnum;
  self.getInv = () => self.inventory;
  self.getRoom = () => self.room;
  self.getUuid = () => self.uuid;
  self.getDefenses = () => self.defenses;
  self.getLocations = () => Object.keys(self.defenses);
  self.getAttribute = attr =>
    typeof self.attributes[attr] !== 'undefined' ?
    self.attributes[attr] :
    false;

  self.getTypes = () => self.types;
  self.hasType = type => self.types.indexOf(type) > -1;
  self.addType = type => self.types.push(type);

  self.setUuid = uid => self.uuid = uid;

  self.setRoom = room => self.room = room;

  //TODO: Have spawn inventory but also add same inv functionality as player
  self.setInventory = identifier => self.inventory = identifier;
  self.setInCombat = combat => self.inCombat = combat;
  self.setContainer = uid => self.container = uid;
  self.setAttribute = (attr, val) => self.attributes[attr] = val;
  self.removeEffect = eff => { delete self.effects[eff]; };

  self.isInCombat = () => self.inCombat;
  self.isPacifist = () => !self.listeners('combat').length;
  /**#@-*/

  /**
   * Get specific currently applied effect, or all current effects
   * @param string aff
   * @return Array|Object
   */
  self.getEffects = eff => {
    if (eff) {
      return self.effects[eff] ?
        self.effects[eff] : false;
    }
    return self.effects;
  };

  /**
   * Add, activate and set a timer for an affect
   * @param string name
   * @param object affect
   */
  self.addEffect = (name, effect) => {
    if (effect.activate) {
      effect.activate();
    }

    setTimeout(() => {
      if (effect.deactivate) {
        effect.deactivate();
      }
      self.removeEffect(name);
    }, effect.duration * 1000);
    self.effects[name] = 1;
  };

  /**
   * Helper for getting strings that may or may not be translated
   * @param string thing Property of npc
   * @param string locale Locale of player
   * @return string Translated string
   */
  const getTranslatedString = (thing, locale) =>
    typeof self[thing] === 'string' ?
      self[thing] :
      (locale in self[thing] ? self[thing][locale] : 'UNTRANSLATED - Contact an admin');

  /**
   * Get the description, localized if possible
   * @param string locale
   * @return string
   */
  self.getDescription = locale => getTranslatedString('description', locale);

  /**
   * Get the attack, localized if possible
   * @param string locale
   * @return string
   */
  self.getAttack = locale => getTranslatedString('attack', locale);

  /**
   * Get the title, localized if possible
   * @param string locale
   * @return string
   */
  self.getShortDesc = locale => getTranslatedString('short_description', locale);

  /**
   * Get the title, localized if possible
   * @param string locale
   * @return string
   */
  self.getKeywords = locale =>
    Array.isArray(self.keywords) ?
      self.keywords :
      (locale in self.keywords ? self.keywords[locale] : 'UNTRANSLATED - Contact an admin');

  /**
   * check to see if an npc has a specific keyword
   * @param string keyword
   * @param string locale
   * @return boolean
   */
  self.hasKeyword = (keyword, locale) =>
    self.getKeywords(locale).some( word => keyword === word );

  /**
   * Get attack speed of an npc in ms
   * @return float
   */
  self.getAttackSpeed = () => self.getAttribute('speed') * 1000 || 1000;

  /**
   * Get the damage an npc can do
   * @return obj {min: int, max: int}
   */
  self.getDamage = () => {
    const defaultDamage = [1, 20];
    const damage = self.getAttribute('damage') ?
      self.getAttribute('damage').split('-').map(n => parseInt(n, 10)) :
      defaultDamage;
    return { min: damage[0], max: damage[1] };
  };

  /**
   * Get the damage to sanity an npc can do
   * @return obj {min: int, max: int} || false
   */
  self.getSanityDamage = () => {
    const damage = self.getAttribute('sanity_damage') ?
      self.getAttribute('sanity_damage').split('-').map(n => parseInt(n, 10)) :
      false;
    return damage ? { min: damage[0], max: damage[1] } : false;
  };

  /**
   * Helper to get just one area's defense
   * @param string location
   */
  self.getDefense = location => self.defenses[location || 'body'] || 0;

  /**
   * Method to apply physical damage
   * @param int raw damage
   * @param string location
   * @return int final damage dealt
   */
  self.damage = (dmg, location) => {
    if (dmg) {
      location = location || 'body';
      const damageDone = Math.max(1, dmg - calculateDefense(location));

      self.setAttribute('health', Math.max(0, self.getAttribute('health') - damageDone));
      util.log('Damage done to ' + self.getShortDesc('en') + ': ' + damageDone);

      return damageDone;
    }
  };

  /**
   * Helper to calculate damage reduction
   * @param  string location hit
   * @return  int damage soaked
   */

  function calculateDefense(location) {
    let defense = self.getDefense(location);
    if (location !== 'body') {
      defense += self.getDefense('body');
    }
    util.log(self.getShortDesc('en') + ' ' + location + ' def: ' + defense);
    return defense;
  }

  self.init(config);
};


util.inherits(Npc, events.EventEmitter);

exports.Npcs = Npcs;
exports.Npc = Npc;
