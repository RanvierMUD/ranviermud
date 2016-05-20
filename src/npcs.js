var fs       = require('fs'),
    util     = require('util'),
    uuid     = require('node-uuid'),
    events   = require('events'),
    Data     = require('./data.js').Data;

var npcs_dir         = __dirname + '/../entities/npcs/';
var npcs_scripts_dir = __dirname + '/../scripts/npcs/';
var l10n_dir         = __dirname + '/../l10n/scripts/npcs/';

/**
 * Npc container class. Loads/finds npcs
 */
var Npcs = function () {
	var self = this;
	self.npcs = {};
	self.load_count = {};

	/**
	 * Load NPCs from the configs
	 * @param boolean verbose Whether to do verbose logging
	 * @param callback
	 */
	self.load = function (verbose, callback)
	{
		verbose = verbose || false;
		var log = function (message) { if (verbose) util.log(message); };
		var debug = function (message) { if (verbose) util.debug(message); };

		log("\tExamining npc directory - " + npcs_dir);
		var npcs = fs.readdir(npcs_dir, function (err, files)
		{
			// Load any npc files
			for (j in files) {
				var npc_file = npcs_dir + files[j];
				if (!fs.statSync(npc_file).isFile()) continue;
				if (!npc_file.match(/yml$/)) continue;

				// parse the npc files
				try {
					var npc_def = require('js-yaml').load(fs.readFileSync(npc_file).toString('utf8'));
				} catch (e) {
					log("\t\tError loading npc - " + npc_file + ' - ' + e.message);
					continue;
				}

				// create and load the npcs
				npc_def.forEach(function (npc) {
					var validate = ['keywords', 'short_description', 'vnum'];

					var err = false;
					for (var v in validate) {
						if (!(validate[v] in npc)) {
							log("\t\tError loading npc in file " + npc + ' - no ' + validate[v] + ' specified');
							err = true;
							return;
						}
					}

					// max load for npcs so we don't have 1000 npcs in a room due to respawn
					if (self.load_count[npc.vnum] && self.load_count[npc.vnum] >= npc.load_max) {
						log("\t\tMaxload of " + npc.load_max + " hit for npc " + npc.vnum);
						return;
					}

					npc = new Npc(npc);
					npc.setUuid(uuid.v4());
					log("\t\tLoaded npc [uuid:" + npc.getUuid() + ', vnum:' + npc.vnum + ']');
					self.add(npc);
				});
			}

			if (callback) {
				callback();
			}
		});
	};

	/**
	 * Add an npc and generate a uuid if necessary
	 * @param Npc npc
	 */
	self.add = function (npc)
	{
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
	self.getByVnum = function (vnum)
	{
		var objs = [];
		self.each(function (o) {
			if (o.getVnum() === vnum) {
				objs.push(o);
			}
		});
		return objs;
	};

	/**
	 * retreive an instance of an npc by uuid
	 * @param string uid
	 * @return Npc
	 */
	self.get = function (uid)
	{
		return self.npcs[uid];
	};

	/**
	 * proxy Array.each
	 * @param function callback
	 */
	self.each = function (callback)
	{
		for (var obj in self.npcs) {
			callback(self.npcs[obj]);
		}
	};

	/**
	 * Blows away an NPC
	 * WARNING: If you haven't removed the npc from the room it's in shit _will_ break
	 * @param Npc npc
	 */
	self.destroy = function (npc)
	{
		delete self.npcs[npc.getUuid()];
		delete npc;
	};
}

/**
 * Actual class for NPCs
 */
var Npc = function (config)
{
	var self = this;

	self.keywords;
	self.short_description;
	self.attack;
	self.description;
	self.room; // Room that it's in (vnum)
	self.vnum; // Not to be confused with its vnum
	self.in_combat = false;
	self.uuid = null;

	// attributes
	self.attributes = {
		max_health : 0,
		health: 0,
		level: 1
	};

	// Anything affecting the NPC
	self.effects = {
	};

	/**
	 * constructor
	 * @param object config
	 */
	self.init = function (config)
	{
		self.short_description = config.short_description || '';
		self.keywords          = config.keywords    || [];
		self.attack            = config.attack      || {en: 'strike'};
		self.description       = config.description || '';
		self.room              = config.room        || null;
		self.vnum              = config.vnum;
		self.defenses          = {};

		for (var i in config.attributes || {}) {
			self.attributes[i] = config.attributes[i];
		}

		for (var i in config.defenses || {}) {
			self.defenses[i] = config.defenses[i];
		}

		Data.loadListeners(config, l10n_dir, npcs_scripts_dir, Data.loadBehaviors(config, 'npcs/', self));
	};

	/**#@+
	 * Mutators
	 */
	self.getVnum      = function () { return self.vnum; };
	self.getInv       = function () { return self.inventory; };
	self.isInCombat   = function () { return self.in_combat; };
	self.getRoom      = function () { return self.room; };
	self.getUuid      = function () { return self.uuid; };
	self.getAttribute = function (attr) { return typeof self.attributes[attr] !== 'undefined' ? self.attributes[attr] : false; };
	self.setUuid      = function (uid) { self.uuid = uid; };
	self.setRoom      = function (room) { self.room = room; };
	self.setInventory = function (identifier) { self.inventory = identifier; }
	self.setInCombat  = function (combat) { self.in_combat = combat; }
	self.setContainer = function (uid) { self.container = uid; }
	self.setAttribute = function (attr, val) { self.attributes[attr] = val; };
	self.removeEffect = function (aff) { delete self.effects[aff]; };
	self.getDefenses  = function () { return self.defenses; };
	self.getLocations = function () { return Object.keys(self.defenses); };
  self.isPacifist   = () => !self.listeners('combat').length;
	/**#@-*/

	/**
	 * Get currently applied effects
	 * @param string aff
	 * @return Array|Object
	 */
	self.getEffects = function (aff)
	{
		if (aff) {
			return typeof self.effects[aff] !== 'undefined' ? self.effects[aff] : false;
		}
		return self.effects;
	};

	/**
	 * Add, activate and set a timer for an affect
	 * @param string name
	 * @param object affect
	 */
	self.addEffect = function (name, effect)
	{
		if (effect.activate) {
			effect.activate();
		}

		setTimeout(function () {
			if (effect.deactivate) {
				effect.deactivate();
			}
			self.removeEffect(name);
		}, effect.duration * 1000);
		self.effects[name] = 1;
	};

	//TODO: dry-ify the following

	/**
	 * Get the description, localized if possible
	 * @param string locale
	 * @return string
	 */
	self.getDescription = function (locale)
	{
		return typeof self.description === 'string' ?
			self.description :
			(locale in self.description ? self.description[locale] : 'UNTRANSLATED - Contact an admin');
	};

	/**
	 * Get the attack, localized if possible
	 * @param string locale
	 * @return string
	 */
	self.getAttack = function (locale)
	{
		return typeof self.attack === 'string' ?
			self.attack :
			(locale in self.attack ? self.attack[locale] : 'UNTRANSLATED - Contact an admin');
	};

	/**
	 * Get the title, localized if possible
	 * @param string locale
	 * @return string
	 */
	self.getShortDesc = function (locale)
	{
		return typeof self.short_description === 'string' ?
			self.short_description :
			(locale in self.short_description ? self.short_description[locale] : 'UNTRANSLATED - Contact an admin');
	}

	/**
	 * Get the title, localized if possible
	 * @param string locale
	 * @return string
	 */
	self.getKeywords = function (locale)
	{
		return Array.isArray(self.keywords) ?
			self.keywords :
			(locale in self.keywords ? self.keywords[locale] : 'UNTRANSLATED - Contact an admin');
	}

	/**
	 * check to see if an npc has a specific keyword
	 * @param string keyword
	 * @param string locale
	 * @return boolean
	 */
	self.hasKeyword = function (keyword, locale)
	{
		return self.getKeywords(locale).some(function (word) { return keyword === word });
	};

	/**
	 * Get attack speed of an npc
	 * @return float
	 */
	self.getAttackSpeed = function ()
	{
		return self.getAttribute('speed') * 1000 || 1000;
	};

	/**
	 * Get the damage an npc can do
	 * @return obj {min: int, max: int}
	 */
	self.getDamage = function ()
	{
		var base = [1, 20];
		var damage = self.getAttribute('damage') ?
			self.getAttribute('damage').split('-').map(function (i) { return parseInt(i, 10); })
			: base;
		return {min: damage[0], max: damage[1]};
	};

	/**
	 * Get the damage to sanity an npc can do
	 * @return obj {min: int, max: int} || false
	 */
	self.getSanityDamage = function ()
	{
		var damage = self.getAttribute('sanity_damage') ?
			self.getAttribute('sanity_damage').split('-').map(function (i) { return parseInt(i, 10); })
			: false;
		return damage ? {min: damage[0], max: damage[1]} : false;
	};

	/**
	* Helper to get just one area's defense
	* @param string location
	*/
	self.getDefense = function(location){
		location = location || 'body';
		return self.defenses[location] || 0;
	};

	/**
   * Helper to calculate physical damage
   * @param int damage
   * @param string location
   */
  self.damage = function(dmg, location) {
    if (!dmg) return;
    location = location || 'body';
    damageDone = Math.max(1, dmg - calculateDefense(location));
    self.setAttribute('health', Math.max(0, self.getAttribute('health') - damageDone));
    util.log('Damage done to ' + self.getShortDesc('en') + ': ' + damageDone);

    return damageDone;
  };

  function calculateDefense(location) {
    var defense = self.getDefense(location);
    if (location !== 'body')
      defense += self.getDefense('body');
    util.log(self.getShortDesc('en') + ' ' + location + ' def: ' + defense);
    return defense;
  }

	self.init(config);
};
util.inherits(Npc, events.EventEmitter);

exports.Npcs = Npcs;
exports.Npc  = Npc;
