'use strict';

const EventEmitter = require('events');
const uuid = require('uuid/v4');

const ItemType = require('./ItemType');
const Logger = require('./Logger');
const Metadatable = require('./Metadatable');
const Player = require('./Player');
const { Inventory, InventoryFullError } = require('./Inventory');

/**
 * @property {Area}    area        Area the item belongs to (warning: this is not the area is currently in but the
 *                                 area it belongs to on a fresh load)
 * @property {object}  metadata    Essentially a blob of whatever attrs the item designer wanted to add
 * @property {array|string}  behaviors Single or list of behaviors this object uses
 * @property {string}  description Long description seen when looking at it
 * @property {number}  id          vnum
 * @property {boolean} isEquipped  Whether or not item is currently equipped
 * @property {Map}     inventory   Current items this item contains
 * @property {string}  name        Name shown in inventory and when equipped
 * @property {Room}    room        Room the item is currently in
 * @property {string}  roomDesc    Description shown when item is seen in a room
 * @property {string}  script      A custom script for this item
 * @property {ItemType|string} type
 * @property {string}  uuid        UUID differentiating all instances of this item
 * @property {boolean} closeable   Whether this item can be closed (Default: false, true if closed or locked is true)
 * @property {boolean} closed      Whether this item is closed
 * @property {boolean} locked      Whether this item is locked
 * @property {entityReference} lockedBy Item that locks/unlocks this item
 *
 * @extends EventEmitter
 * @mixes Metadatable
 */
class Item extends Metadatable(EventEmitter) {
  constructor (area, item) {
    super();
    const validate = ['keywords', 'name', 'id'];

    for (const prop of validate) {
      if (!(prop in item)) {
        throw new ReferenceError(`Item in area [${area.name}] missing required property [${prop}]`);
      }
    }

    this.area = area;
    this.metadata  = item.metadata || {};
    this.behaviors = item.behaviors || {};
    this.defaultItems = item.items || [];
    this.description = item.description || 'Nothing special.';
    this.entityReference = item.entityReference; // EntityFactory key
    this.id          = item.id;

    this.maxItems    = item.maxItems || Infinity;
    this.initializeInventory(item.inventory, this.maxItems);

    this.isEquipped  = item.isEquipped || false;
    this.keywords    = item.keywords;
    this.name        = item.name;
    this.room        = item.room || null;
    this.roomDesc    = item.roomDesc || '';
    this.script      = item.script || null;
    this.type        = typeof item.type === 'string' ? ItemType[item.type] : (item.type || ItemType.OBJECT);
    this.uuid        = item.uuid || uuid();
    this.closeable   = item.closeable || item.closed || item.locked || false;
    this.closed      = item.closed || false;
    this.locked      = item.locked || false;
    this.lockedBy    = item.lockedBy || null;
  }

  /**
   * Create an Inventory object from a serialized inventory
   * @param {object} inventory Serialized inventory
   */
  initializeInventory(inventory) {
    if (inventory) {
      this.inventory = new Inventory(inventory);
      this.inventory.setMax(this.maxItems);
    } else {
      this.inventory = null;
    }
  }

  hasKeyword(keyword) {
    return this.keywords.indexOf(keyword) !== -1;
  }

  /**
   * @param {string} name
   * @return {boolean}
   */
  hasBehavior(name) {
    if (!(this.behaviors instanceof Map)) {
        throw new Error("Item has not been hydrated. Cannot access behaviors.");
    }
    return this.behaviors.has(name);
  }

  /**
   * @param {string} name
   * @return {*}
   */
  getBehavior(name) {
    if (!(this.behaviors instanceof Map)) {
        throw new Error("Item has not been hydrated. Cannot access behaviors.");
    }
    return this.behaviors.get(name);
  }

  /**
   * Add an item to this item's inventory
   * @param {Item} item
   */
  addItem(item) {
    this._setupInventory();
    this.inventory.addItem(item);
    item.belongsTo = this;
  }

  /**
   * Remove an item from this item's inventory
   * @param {Item} item
   */
  removeItem(item) {
    this.inventory.removeItem(item);

    // if we removed the last item unset the inventory
    // This ensures that when it's reloaded it won't try to set
    // its default inventory. Instead it will persist the fact
    // that all the items were removed from it
    if (!this.inventory.size) {
      this.inventory = null;
    }
    item.belongsTo = null;
  }

  /**
   * @return {boolean}
   */
  isInventoryFull() {
    this._setupInventory();
    return this.inventory.isFull;
  }

  _setupInventory() {
    if (!this.inventory) {
      this.inventory = new Inventory({
        items: [],
        max: this.maxItems
      });
    }
  }

  /**
   * For finding the player who has the item in their possession.
   * @return {Player|null} owner
   */
  findOwner() {
    let found = null;
    let owner = this.belongsTo;
    while (owner) {
      if (owner instanceof Player) {
        found = owner;
        break;
      }

      owner = owner.belongsTo;
    }

    return found;
  }

  /**
   * Open a container-like object
   *
   * @fires Item#opened
   */
  open() {
    if (!this.closed) {
      return;
    }

    /**
     * @event Item#opened
     */
    this.emit('opened');
    this.closed = false;
  }

  /**
   * @fires Item#closed
   */
  close() {
    if (this.closed || !this.closeable) {
      return;
    }

    /**
     * @event Item#closed
     */
    this.emit('closed');
    this.closed = true;
  }

  /**
   * @fires Item#locked
   */
  lock() {
    if (this.locked || !this.closeable) {
      return;
    }

    this.close();
    /**
     * @event Item#locked
     */
    this.emit('locked');
    this.locked = true;
  }

  /**
   * @fires Item#unlocked
   */
  unlock() {
    if (!this.locked) {
      return;
    }

    /**
     * @event Item#unlocked
     */
    this.emit('unlocked');
    this.locked = false;
  }

  hydrate(state, serialized = {}) {
    this.metadata = JSON.parse(JSON.stringify(serialized.metadata || this.metadata));
    this.closed = 'closed' in serialized ? serialized.closed : this.closed;
    this.locked = 'locked' in serialized ? serialized.locked : this.locked;

    if (typeof this.area === 'string') {
      this.area = state.AreaManager.getArea(this.area);
    }

    // if the item was saved with a custom inventory hydrate it
    if (this.inventory) {
      this.inventory.hydrate(state, this);
    } else {
    // otherwise load its default inv
      this.defaultItems.forEach(defaultItemId => {
        Logger.verbose(`\tDIST: Adding item [${defaultItemId}] to item [${this.name}]`);
        const newItem = state.ItemFactory.create(this.area, defaultItemId);
        newItem.hydrate(state);
        state.ItemManager.add(newItem);
        this.addItem(newItem);
      });
    }

    // perform deep copy if behaviors is set to prevent sharing of the object between
    // item instances
    const behaviors = JSON.parse(JSON.stringify(serialized.behaviors || this.behaviors));
    this.behaviors = new Map(Object.entries(behaviors));

    for (let [behaviorName, config] of this.behaviors) {
      let behavior = state.ItemBehaviorManager.get(behaviorName);
      if (!behavior) {
        Logger.warn(`No script found for item behavior ${behaviorName}`);
        continue;
      }

      // behavior may be a boolean in which case it will be `behaviorName: true`
      config = config === true ? {} : config;
      behavior.attach(this, config);
    }
  }

  serialize() {
    let behaviors = {};
    for (const [key, val] of this.behaviors) {
      behaviors[key] = val;
    }

    return {
      entityReference: this.entityReference,
      inventory: this.inventory && this.inventory.serialize(),

      // metadata is serialized/hydrated to save the state of the item during gameplay
      // example: the players a food that is poisoned, or a sword that is enchanted
      metadata: this.metadata,

      closed: this.closed,
      locked: this.locked,

      // behaviors are serialized in case their config was modified during gameplay
      // and that state needs to persist (charges of a scroll remaining, etc)
      behaviors,
    };
  }
}

module.exports = Item;
