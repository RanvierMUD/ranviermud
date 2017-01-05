'use strict';
const fs = require('fs'),
  util   = require('util'),
  uuid   = require('node-uuid'),
  events = require('events'),
  Data   = require('./data.js').Data,
  _      = require('./helpers'),
  Effect = require('./effect').Effect;

const npcs_dir = __dirname + '/../entities/npcs/';
const npcs_scripts_dir = __dirname + '/../scripts/npcs/';
const l10n_dir = __dirname + '/../l10n/scripts/npcs/';

const CombatUtil = require('./combat_util').CombatUtil;

//TODO: Make NPCs persistent. Have a load-minimum so that if the amt of NPCs falls below the min,
//     then more will spawn at the proper interval.
//TODO: Extract npc from this file like player/player_manager

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
		fs.readdir(npcs_dir, (err, files) => {

			// Load any npc files
			for (const j in files) {
				const npc_file = npcs_dir + files[j];
				if (!fs.statSync(npc_file).isFile()) continue;
				if (!npc_file.match(/yml$/)) continue;

        let npc_def;
				// parse the npc files
				try {
          const npcDefinitionYaml = fs.readFileSync(npc_file).toString('utf8');
          npc_def = require('js-yaml').load(npcDefinitionYaml);
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
   * proxy Array.find
   * @param function callback
   */
  self.find = callback => _.values(self.npcs).find(callback)

  /**
   * proxy Array.each
   * @param function callback
   */

  self.each = callback => _.values(self.npcs).forEach(callback);

  /**
   * proxy Array.each with condition
   * @param function callback
   */
  self.eachIf = (predicate, callback) => {
    for (let one in self.npcs) {
      const npc = self.npcs[one];
      if (predicate(npc)) {
        callback(npc);
      }
    }
  }

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
  self.inCombat = [];
  self.uuid = null;


  //TODO: Make attributes more or less match that of the player.
  self.attributes = {
    max_health: 0,
    health: 0,
    level: 1
  };

  self.effects = new Map();

  /**
   * tha real constructor
   * @param object config
   */
  self.init = function (config) {
    self.short_description = config.short_description || '';
    self.name = config.name || '';
    self.keywords = config.keywords || [];
    self.attack = config.attack || { en: 'strike' };
    self.description = config.description || '';
    self.room = config.room || null;
    self.vnum = config.vnum;
    self.types = config.types || [];
    self.defenses = {};
    self.inDialogue = false;
    self.room_description  = config.room_description;
    self.short_description = config.short_description;

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
  self.getVnum    = () => self.vnum;
  self.getUuid    = () => self.uuid;

  self.getInventory = () => self.inventory;
  self.getRoom      = () => self.room;
  self.getLocation  = self.getRoom;

  self.getDefenses  = () => self.defenses;
  self.getBodyParts = () => Object.keys(self.defenses);
  self.getAttribute = attr =>
    typeof self.attributes[attr] !== 'undefined' ?
    self.attributes[attr] :
    false;

  self.getTypes = () => self.types;
  self.hasType = type => _.has(self.types, type);
  self.addType = type => self.types.push(type);

  self.setUuid = uid => self.uuid = uid;
  self.setRoom = room => self.room = room;

  //TODO: Have spawn inventory but also add same inv functionality as player
  self.setInventory = identifier  => self.inventory = identifier;
  self.setAttribute = (attr, val) => self.attributes[attr] = val;

  self.isInCombat       = ()        => self.inCombat.length > 0;
  self.setInCombat      = combatant => self.inCombat.push(combatant);
  self.getInCombat      = ()        => self.inCombat;
  self.fleeFromCombat   = ()        => self.inCombat = [];
  self.removeFromCombat = combatant => {
    const combatantIndex = self.inCombat.indexOf(combatant);
    if (combatantIndex === -1) { return; }
    self.inCombat.splice(combatantIndex, 1);
  }

  self.isPacifist = () => !self.listeners('combat').length;

  self.startDialogue = () => self.inDialogue = true;
  self.endDialogue   = () => self.inDialogue = false;
  self.isInDialogue  = () => self.inDialogue;
  /**#@-*/

  self.combat = CombatUtil.getHelper(self);

  /**
   * Get specific currently applied effect, or all current effects
   * @param string aff
   * @return Array|Object
   */
  self.getEffects = eff => eff ? self.effects.get(eff) : self.effects;

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
  };

  /**
   * Helper for getting strings that may or may not be translated
   * @param string thing Property of npc
   * @param string locale Locale of player
   * @return string Translated string
   */

  /**
   * Get the description, localized if possible
   * @param string locale
   * @return string
   */
  self.getDescription = () => self.description

  /**
   * Get the attack, localized if possible
   * @param string locale
   * @return string
   */
  self.getAttack = () => self.attack;

  /**
   * Get the title, localized if possible
   * @param string locale
   * @return string
   */ //TODO: Consider passing in player object to see if player recognizes the item
   // //      IS that an observer pattern?
  self.getShortDesc = () => self.short_description || self.description;

  self.getRoomDesc = () => self.room_description || self.short_description || self.description;

  self.getName = () => self.name;
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
    Array.isArray(self.getKeywords(locale)) ?
      self.getKeywords(locale).some( word => keyword === word ) :
      self.getKeywords(locale).includes(keyword);

  /**
   * Get the damage to sanity an npc can do
   * @return obj {min: int, max: int} || false
   */
  self.getSanityDamage = () => {
    const damage = self.getAttribute('sanity_damage') ?
      self.getAttribute('sanity_damage').split('-').map(n => parseInt(n, 10)) :
      false;
    return damage;
  };

  /**
   * Helper to get just one area's defense
   * @param string location
   */
  self.getDefense = location => parseInt(self.defenses[location || 'body'], 10) || 0;

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
