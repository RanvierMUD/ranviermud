var fs       = require('fs'),
    util     = require('util'),
    uuid     = require('node-uuid'),
    events   = require('events'),
    Localize = require('localize'),
    Data     = require('./data.js').Data;

var npcs_dir        = __dirname + '/../entities/npcs/';
var npcs_script_dir = __dirname + '/../scripts/npcs/';
var l10n_dir        = __dirname + '/../l10n/scripts/npcs/';

/**
 * Npc container class. Loads/finds npcs
 */
var Npcs = function () {
	var self = this;
	self.npcs = {};

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
				for (var vnum in npc_def) {
					var npc = npc_def[vnum];
					var validate = ['keywords', 'short_description', 'vnum'];

					var err = false;
					for (var v in validate) {
						if (!(validate[v] in npc)) {
							log("\t\tError loading npc in file " + npc + ' - no ' + validate[v] + ' specified');
							err = true;
							break;
						}
					}

					if (err) {
						continue;
					}

					if (npc.vnum in self.npcs) {
						log("\t\tConflicting vnum [" + npc.vnum + '] when loading npc ' + npc);
						continue;
					}


					npc = new Npc(npc);
					Data.loadListeners(npc_def[vnum], l10n_dir, npcs_script_dir, npc);
					npc.setUuid(uuid.v4());
					log("\t\tLoaded npc [vnum:" + npc.getUuid() + ', ' + npc.getShortDesc('en') + ']');
					self.add(npc);
				}
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
}

/**
 * Actual class for NPCs
 */
var Npc = function (config)
{
	var self = this;

	self.keywords;
	self.short_description
	self.description;
	self.room; // Room that it's in (vnum)
	self.vnum; // Not to be confused with its vnum
	self.in_combat = false;
	self.uuid = null;

	/**
	 * constructor
	 * @param object config
	 */
	self.init = function (config)
	{
		self.short_description = config.short_description || '';
		self.keywords          = config.keywords    || [];
		self.description       = config.description || '';
		self.room              = config.room        || null;
		self.vnum              = config.vnum;
	};

	self.getVnum      = function () { return self.vnum; };
	self.getInv       = function () { return self.inventory; };
	self.isInCombat   = function () { return self.in_combat; };
	self.getRoom      = function () { return self.room; };
	self.getUuid      = function () { return self.uuid; };
	self.setUuid      = function (uid) { self.uuid = uid; };
	self.setRoom      = function (room) { self.room = room; };
	self.setInventory = function (identifier) { self.inventory = identifier; }
	self.setInCombat  = function (combat) { self.in_combat = combat; }
	self.setContainer = function (uid) { self.container = uid; }

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

	self.init(config);
};
util.inherits(Npc, events.EventEmitter);

exports.Npcs = Npcs;
exports.Npc  = Npc;
