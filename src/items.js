'use strict';

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
	self.objects    = {};
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
				object_def.forEach(object => {
					const validate = ['keywords', 'short_description', 'vnum'];

					for (var v in validate) {
						if (!(validate[v] in object)) {
              throw new ReferenceError('Error loading object in file ' + object + ' - no ' + validate[v] + ' specified')
						}
					}

					// max load for items so we don't have 1000 items in a room due to respawn
          const maxLoadHit = self.load_count[object.vnum] && self.load_count[object.vnum] >= object.load_max;
					if (maxLoadHit) {
						log("\t\tMaxload of " + object.load_max + " hit for object " + object.vnum);
						return;
					}

					const newObject = object = new Item(object);
					newObject.setUuid(uuid.v4());
					log("\t\tLoaded item [uuid:" + newObject.getUuid() + ', vnum:' + newObject.vnum + ']');
					self.addItem(newObject);
				});
			}

			if (callback) { callback(); }
		});

	};

	/**
	 * Add an item and generate a uuid if necessary
	 * @param Item item
	 */
	self.addItem = item => {
		if (!item.getUuid()) {
			item.setUuid(uuid.v4());
		}
		self.objects[item.getUuid()] = item;
		self.load_count[item.vnum] = self.load_count[item.vnum] ? self.load_count[item.vnum] + 1 : 1;
	};

	/**
	 * Gets all instance of an object by vnum
   * //TODO: Consider using this when checking to see if objs should be loaded.
	 * @param int vnum
	 * @return Item
	 */
	self.getByVnum = vnum => self.filter(obj => obj.getVnum() === vnum);

	/**
	 * retreive an instance of an object by uuid
	 * @param string uid
	 * @return Item
	 */
	self.get = uid => self.objects[uid];

	/**
	 * proxy Array.each
	 * @param function callback
	 */
	self.each = callback   => _.values(self.objects).forEach(callback);

  /**
   * proxy Array.filter
   * @param function callback
   */
  self.filter = callback => _.values(self.objects).filter(callback);

}

const Item = function ItemConstructor(config) {
	const self = this;

  // Fields
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

	self.init = config => {
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
	self.getVnum      = () => self.vnum;
	self.getInventory = () => self.inventory;
	self.isNpcHeld    = () => self.npc_held;
	self.isEquipped   = () => self.equipped;
	self.getRoom      = () => self.room;
	self.getContainer = () => self.container;
	self.getUuid      = () => self.uuid;
	self.getAttribute = () => self.attributes[attr] || null;
  /*  Setters, these also return the value that is set */
	self.setUuid      = uid         => self.uuid      = uid       , uid;
	self.setRoom      = room        => self.room      = room      , room;
	self.setInventory = identifier  => self.inventory = identifier, identifier;
	self.setNpcHeld   = held        => self.npc_held  = held      , held;
	self.setContainer = uid         => self.container = uid       , uid;
	self.setEquipped  = equip       => self.equipped  = !!equip   , equip;
	self.setAttribute = (attr, val) => self.attributes[attr] = val, val;
	/**#@-*/

	/**
	 * Get the description, localized if possible
	 * @param string locale
	 * @return string
	 */
	self.getDescription = () => typeof self.description === 'string' ?
			self.description :
			self.description['en'];

	/**
	 * Get the title, localized if possible
	 * @param string locale
	 * @return string
	 */
	self.getShortDesc = () => typeof self.short_description === 'string' ?
			self.short_description :
			self.short_description['en'];

	/**
	 * Get the title, localized if possible
	 * @param string locale
	 * @return string
	 */
	self.getKeywords = () => Array.isArray(self.keywords) ?
			self.keywords :
      self.keywords['en'] || [];

	/**
	 * check to see if an item has a specific keyword
	 * @param string keyword
	 * @param string locale
	 * @return boolean
	 */
	self.hasKeyword = (keyword, locale) => _.has(self.getKeywords(locale || 'en'), keyword);


	/**
	 * Used when persisting a copy of an item to a JSON
   * (right now this only happens if it is in a player's inventory)
	 * @return object
	 */
	self.flatten = () => ({
			uuid:              self.uuid,
			keywords:          self.keywords,
			short_description: self.short_description,
			description:       self.description,
			inventory:         self.inventory,     // Player or Npc object that is holding it
			vnum:              self.vnum,
			script:            self.script,
			equipped:          self.equipped,
			attributes:        self.attributes
		});

	self.init(config);
};

util.inherits(Item, events.EventEmitter);

exports.Items = Items;
exports.Item  = Item;
