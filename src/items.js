'use strict';

const fs    = require('fs'),
    util    = require('util'),
    yaml    = require('js-yaml'),
    uuid    = require('node-uuid'),
    events  = require('events'),
    Data    = require('./data.js').Data;

const objects_dir =         __dirname + '/../entities/objects/';
const l10n_dir    =         __dirname + '/../l10n/scripts/objects/';
const objects_scripts_dir = __dirname + '/../scripts/objects/';
const ItemUtil = require('./item_util').ItemUtil;
const _ 			 = require('./helpers');

const Items = function ItemsManager() {
	const self = this;
	self.objects    = {};
	self.load_count = {};

	self.getScriptsDir = () => objects_scripts_dir;
	self.getL10nDir    = () => l10n_dir;

	self.load = (verbose, callback) => {

    const log   = message => { if (verbose) util.log(message); };
    const debug = message => { if (verbose) util.debug(message); };

		log("\tExamining object directory - " + objects_dir);
    fs.readdir(objects_dir, (err, files) => {

      // Load any object files
			for (let j in files) {
				const object_file = objects_dir + files[j];

        //TODO: Extract to Data helper method.
				if (!fs.statSync(object_file).isFile()) { continue; }
				if (!object_file.match(/yml$/)) { continue; }

				// parse the object files
        let objectDefinitions = [];
				try {
          const objectFile  = fs.readFileSync(object_file).toString('utf8');
          const objectYaml  = yaml.load(objectFile)
					objectDefinitions = objectDefinitions.concat(objectYaml);
				} catch (e) {
					log("\t\tError loading object - " + object_file + ' - ' + e.message);
					continue;
				}

        // create and load the objects
				objectDefinitions.forEach(object => {
					const validate = ['keywords', 'short_description', 'vnum'];

					for (let v in validate) {
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

					const newObject = new Item(object);
					newObject.setUuid(uuid.v4());

					log("\t\tLoaded item [uuid:" + newObject.getUuid() + ', vnum:' + newObject.vnum + ']');
					self.addItem(newObject);
				});

			}

      log("Loading inventories into containers...");
      self.each(item => {
        if (item.inventory) {
          log("Loading inventory [container: " + item.getUuid() + " vnum: " + item.getVnum() + "]");
          self.spawnContainerInventory(item);
        }
      });

			if (callback) { callback(); }
		});

	};

  //TODO: Account for persisted items eventually (uuids rather than vnums)
  self.spawnContainerInventory = (container, config) => {
    const containerVnum = container.getVnum();

    const hydrateContentsByVnum = vnum => {
      const items = self
        .getByVnum(vnum)
        .filter(item => containerVnum === item.getContainer());
      items.forEach(item => item.setContainer(container.getUuid()));
      return items.map(item => item.getUuid());
    }

    const inv = container.getInventory();
    const containerItems = inv && inv.length ?
      inv.map(hydrateContentsByVnum) :
      [];

    const containerInventory = _.flatten(containerItems);
    container.setInventory(containerInventory);
  }

	/**
	 * Add an item and generate a uuid if necessary
	 * @param Item item
	 */
	self.addItem = item => {
		if (!item.getUuid()) {
			item.setUuid(item.uuid || uuid.v4());
		}
		util.log(`Adding new item ${item.getShortDesc()} as uuid ${item.getUuid()}`);
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
	 * retrieve an instance of an object by uuid
	 * @param string uid
	 * @return Item
	 */
	self.get = uid => self.objects[uid];

	/**
	 * proxy Array.each
	 * @param function callback
	 */
	self.each = callback => _.values(self.objects).forEach(callback);

  /**
   * proxy Array.find
   * @param function callback
   */
  self.each = callback => _.values(self.objects).find(callback);

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
	self.container;     // Itemception (uid)
	self.vnum;
	self.uuid = null;
	self.equipped = false;
	self.script = null;
	self.attributes = {};
  self.prerequisites = {};

	self.init = config => {
		self.short_description = config.short_description || '';
    self.room_description  = config.room_description  || '';
    self.keywords          = config.keywords      || []; // Required
		self.description       = config.description   || '';
    //TODO: Every other class uses .location for the room vnum, right? use .location and .getLocation
		self.room              = config.room          || null;
		self.npc_held          = config.npc_held      || false;
		self.equipped          = config.equipped      || false;
		self.container         = config.container     || null;
		self.uuid              = config.uuid          || null;
		self.vnum              = config.vnum;         // Required
		self.script            = config.script        || null;
		self.attributes        = config.attributes    || {};
    self.prerequisites     = config.prerequisites || {};
    self.holder            = config.holder        || '';
		self.behaviors         = config.behaviors     || null;

    self.inventory = config.inventory || (self.isContainer() ? [] : null);

    if (self !== null) {
		  Data.loadListeners(config, l10n_dir, objects_scripts_dir, Data.loadBehaviors(config, 'objects/', self));
    }
	};

	/**#@+
	 * Mutators
	 */
	self.getVnum      = ()   => self.vnum;
	self.getInventory = ()   => self.inventory;
	self.isNpcHeld    = ()   => self.npc_held;
  self.getHolder    = ()   => self.holder; // Name/uid of player/npc holding it.
	self.isEquipped   = ()   => self.equipped;
	self.getRoom      = ()   => self.room;
	self.getContainer = ()   => self.container;
	self.getUuid      = ()   => self.uuid;

  self.getAttributes    = ()     => self.attributes    || {};
  self.getPrerequisites = ()     => self.prerequisites || {};
	self.getAttribute     = attr   => self.attributes[attr]    || null;
  self.getPrerequisite  = attr   => self.prerequisites[attr] || null;

	self.setUuid      = uid   => self.uuid      = uid;
	self.setRoom      = room  => self.room      = room;
	self.setInventory = ids   => self.inventory = ids;
	self.setNpcHeld   = held  => self.npc_held  = held;
  self.setHolder    = id    => self.holder    = id;
	self.setContainer = uid   => self.container = uid;
	self.setEquipped  = equip => self.equipped  = !!equip;

	self.setAttribute = (attr, val) => self.attributes[attr] = val;
	/**#@-*/

  self.isContainer = () => (self.getAttribute('maxSizeCapacity') && self.getAttribute('maxWeightCapacity'));

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
	self.getRoomDesc = () => typeof self.room_description === 'string' ?
			self.room_description :
			self.room_description['en'] || self.getShortDesc();

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
   * Takes the player and sees which prereqs it doesn't meet.
   * @param player Obj
   * @return Strings[] missed prerequisites
   */
  self.checkPrerequisites = player => {
    const missedPrereqs = [];
    const playerAttr = player.getAttributes();
    for (let attr in self.prerequisites) {
      const prereq = self.prerequisites[attr];
      const playerStat = playerAttr[attr];
      if (!playerStat || playerStat < prereq) {
        missedPrereqs.push(attr);
      }
    }
    return missedPrereqs;
  }

  self.addItem = item => {
    item.setContainer(self.getUuid());
    return self.inventory.push(item.getUuid());
  }

  self.removeItem = item => {
		const uid = item.getUuid();
    if (self.inventory.indexOf(uid) > -1) {
      self.setInventory(self.getInventory().filter(id => uid !== id));
			item.setContainer(null);
      return item;
    }
    return null;
  }

  self.findInInventory = predicate => self.inventory.find(predicate);

	/**
	 * Get weight of all items inside of a container...
	 * And the container.
	 * @return Number weight
	 */

	self.getWeight = items => self.isContainer() ?
				self.getContainerWeight(items) + self.getAttribute('weight') :
				self.getAttribute('weight');

	self.getContainerWeight = items => self.getInventory()
		.reduce((sum, item) => items.get(item).getWeight() + sum, 0);

	self.getRemainingSizeCapacity = items => self.getAttribute('maxSizeCapacity') - self.getSizeOfContents(items);

	self.getSizeOfContents = items => self
		.getInventory()
		.reduce((sum, uid) => {
			const item = items.get(uid);
			return item.getAttribute('size') + sum;
		}, 0);

	/**
	 * Used when persisting a copy of an item to a JSON
   * (right now this only happens if it is in a player's inventory)
	 * @return object
	 */
	self.flatten = () => ({
			uuid:              self.uuid,
			keywords:          self.keywords,
			short_description: self.short_description,
      room_description:  self.room_description,
			description:       self.description,
			inventory:         self.inventory,
      container:         self.container,
			vnum:              self.vnum,
			script:            self.script,
			equipped:          self.equipped,
			attributes:        self.attributes,
      prerequisites:     self.prerequisites,
			holder:            self.holder,
			behaviors:         self.behaviors
		});

	self.init(config);
};

util.inherits(Item, events.EventEmitter);

exports.Items = Items;
exports.Item  = Item;
