const fs    = require('fs'),
    util    = require('util'),
	   uuid   = require('node-uuid'),
    events  = require('events'),
    Data    = require('./data.js').Data;

const objects_dir = __dirname + '/../entities/objects/';
const l10n_dir    = __dirname + '/../l10n/scripts/objects/';
const objects_scripts_dir = __dirname + '/../scripts/objects/';
const _ = require('./helpers');

const Items = function ItemsManager() {
	const self = this;
	self.objects = {};
	self.load_count = {};

	self.getScriptsDir = () => objects_scripts_dir;
	self.getL10nDir = () => l10n_dir;

	self.load = (verbose, callback) => {

    const log   = message => { if (verbose) util.log(message); };
    const debug = message => { if (verbose) util.debug(message); };

		log("\tExamining object directory - " + objects_dir);
		const objects = fs.readdir(objects_dir, (err, files) =>
		{
			// Load any object files
			for (let j in files) {
				const object_file = objects_dir + files[j];
        //TODO: Extract to Data helper method.
				if (!fs.statSync(object_file).isFile()) continue;
				if (!object_file.match(/yml$/)) continue;

				// parse the object files
        let object_def = [];
				try {
          const objectFile = fs.readFileSync(object_file).toString('utf8');
					object_def = require('js-yaml').load();
				} catch (e) {
					log("\t\tError loading object - " + object_file + ' - ' + e.message);
					continue;
				}

				// create and load the objects
				object_def.forEach(function (object) {
					var validate = ['keywords', 'short_description', 'vnum'];

					var err = false;
					for (var v in validate) {
						if (!(validate[v] in object)) {
							log("\t\tError loading object in file " + object + ' - no ' + validate[v] + ' specified');
							err = true;
							return;
						}
					}

					if (err) {
						return;
					}

					// max load for items so we don't have 1000 items in a room due to respawn
					if (self.load_count[object.vnum] && self.load_count[object.vnum] >= object.load_max) {
						log("\t\tMaxload of " + object.load_max + " hit for object " + object.vnum);
						return;
					}

					object = new Item(object);
					object.setUuid(uuid.v4());
					log("\t\tLoaded item [uuid:" + object.getUuid() + ', vnum:' + object.vnum + ']');
					self.addItem(object);
				});
			}

			if (callback) {
				callback();
			}
		});

	};

	/**
	 * Add an item and generate a uuid if necessary
	 * @param Item item
	 */
	self.addItem = function (item)
	{
		if (!item.getUuid()) {
			item.setUuid(uuid.v4());
		}
		self.objects[item.getUuid()] = item;
		self.load_count[item.vnum] = self.load_count[item.vnum] ? self.load_count[item.vnum] + 1 : 1;
	};

	/**
	 * Gets all instance of an object
	 * @param int vnum
	 * @return Item
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
	 * retreive an instance of an object by uuid
	 * @param string uid
	 * @return Item
	 */
	self.get = function (uid)
	{
		return self.objects[uid];
	};

	/**
	 * proxy Array.each
	 * @param function callback
	 */
	self.each = function (callback)
	{
		for (var obj in self.objects) {
			callback(self.objects[obj]);
		}
	};
}

var Item = function (config)
{
	var self = this;

	self.keywords;
	self.short_description
	self.description;
	self.inventory;     // Player or Npc object that is holding it
	self.npc_held;      // If it's in an inventory is it an NPC's?
	self.room;          // Room that it's in (vnum)
	self.container;     // Itemception (vnum)
	self.vnum;
	self.uuid = null;
	self.equipped = false;
	self.script = null;
	self.attributes = {};

	self.init = function (config)
	{
		self.short_description = config.short_description || '';
		self.keywords          = config.keywords    || [];
		self.description       = config.description || '';
		self.inventory         = config.inventory   || null;
		self.room              = config.room        || null;
		self.npc_held          = config.npc_held    || null;
		self.equipped          = config.equipped    || null;
		self.container         = config.container   || null;
		self.uuid              = config.uuid        || null;
		self.vnum              = config.vnum;
		self.script            = config.script      || null;
		self.attributes        = config.attributes  || {};
		if (self !== null) {
		  Data.loadListeners(config, l10n_dir, objects_scripts_dir, Data.loadBehaviors(config, 'objects/', self));
    }
	};

	/**#@+
	 * Mutators
	 */
	self.getVnum      = function () { return self.vnum; };
	self.getInv       = function () { return self.inventory; };
	self.isNpcHeld    = function () { return self.npc_held; };
	self.isEquipped   = function () { return self.equipped; };
	self.getRoom      = function () { return self.room; };
	self.getContainer = function () { return self.container; };
	self.getUuid      = function () { return self.uuid; };
	self.getAttribute = function (attr) { return self.attributes[attr] || false; };
	self.setUuid      = function (uid)        { self.uuid = uid; };
	self.setRoom      = function (room)       { self.room = room; };
	self.setInventory = function (identifier) { self.inventory = identifier; };
	self.setNpcHeld   = function (held)       { self.npc_held = held; };
	self.setContainer = function (uid)        { self.container = uid; };
	self.setEquipped  = function (equip)      { self.equipped = !!equip; };
	self.setAttribute = function (attr, val)  { self.attributes[attr] = val; };
	/**#@-*/

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
	};

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
	 * check to see if an item has a specific keyword
	 * @param string keyword
	 * @param string locale
	 * @return boolean
	 */
	self.hasKeyword = function (keyword, locale)
	{
		return _.has(self.getKeywords(locale || 'en'), keyword);
	};

	/**
	 * Used when saving a copy of an item to a player
	 * @return object
	 */
	self.flatten = function ()
	{
		return {
			uuid: self.uuid,
			keywords: self.keywords,
			short_description: self.short_description,
			description: self.description,
			inventory: self.inventory,     // Player or Npc object that is holding it
			vnum: self.vnum,
			script: self.script,
			equipped: self.equipped,
			attributes: self.attributes
		};
	};

	self.init(config);
};
util.inherits(Item, events.EventEmitter);

exports.Items = Items;
exports.Item  = Item;
