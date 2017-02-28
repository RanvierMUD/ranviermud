'use strict';

const EventEmitter = require('events');
const uuid = require('node-uuid');
const util = require('util');

const ItemType = require('./ItemType');
const Inventory = require('./Inventory');

/**
 * @property {Area}    area        Area the item belongs to (warning: this is not the area is currently in but the
 *                                 area it belongs to on a fresh load)
 * @property {object}  attributes  Essentially a blob of whatever attrs the item designer wanted to add
 * @property {array|string}  behaviors Single or list of behaviors this object uses
 * @property {string}  description Long description seen when looking at it
 * @property {number}  id          vnum
 * @property {boolean} isEquipped  Whether or not item is currently equipped
 * @property {Map}     inventory   Current items this item contains
 * @property {boolean} isHeld      Whether or not item is currently in an inventory (npc, player, or another object)
 * @property {string}  name        Name shown in inventory and when equipped
 * @property {Room}    room        Room the item is currently in
 * @property {string}  roomDesc    Description shown when item is seen in a room
 * @property {string}  script      A custom script for this item
 * @property {ItemType|string} type
 * @property {string}  uuid        UUID differentiating all instances of this item
 */
class Item extends EventEmitter {
  constructor (area, item) {
    super();
    const validate = ['keywords', 'name', 'id'];

    for (const prop of validate) {
      if (!(prop in item)) {
        throw new ReferenceError(`Item in area [${area.name}] missing required property [${prop}]`);
      }
    }

    this.area = area;
    this.attributes  = item.attributes || {};
    this.behaviors = new Map(Object.entries(item.behaviors || {}));
    this.defaultItems = item.items || [];
    this.description = item.description || 'Nothing special.';
    this.entityReference = item.entityReference; // EntityFactory key
    this.id          = item.id;
    this.inventory   = item.inventory ? new Inventory(item.inventory) : null;
    this.isEquipped  = item.isEquipped || false;
    this.isHeld      = item.isHeld || false;
    this.keywords    = item.keywords;
    this.name        = item.name;
    this.room        = item.room || null;
    this.roomDesc    = item.roomDesc || '';
    this.script      = item.script || null;
    this.slot        = item.slot || null;
    this.type        = typeof item.type === 'string' ? ItemType[item.type] : (item.type || ItemType.OBJECT);
    this.uuid        = item.uuid || uuid.v4();
  }

  // TODO: Implement Attributes/Attribute classes for items?
  getAttribute(attr) {
    return this.attributes[attr];
  }

  setAttribute(attr, val) {
    this.attributes[attr] = val;
  }

  hasKeyword(keyword) {
    return this.keywords.indexOf(keyword) !== -1;
  }

  addItem(item) {
    if (!this.inventory) {
      this.inventory = new Inventory([]);
    }
    this.inventory.addItem(item);
  }

  removeItem(item) {
    this.inventory.removeItem(item);

    // if we removed the last item unset the inventory
    // This ensures that when it's reloaded it won't try to set
    // its default inventory. Instead it will persist the fact
    // that all the items were removed from it
    if (!this.inventory.size) {
      this.inventory = null;
    }
  }

  hydrate(state) {
    if (typeof this.area === 'string') {
      this.area = state.AreaManager.getArea(this.area);
    }

    // if the item was saved with a custom inventory hydrate it
    if (this.inventory) {
      this.inventory.hydrate(state);
    } else {
    // otherwise load its default inv
      this.defaultItems.forEach(defaultItemId => {
        util.log(`\tDIST: Adding item [${defaultItemId}] to item [${this.name}]`);
        const newItem = state.ItemFactory.create(this.area, defaultItemId);
        newItem.hydrate(state);
        state.ItemManager.add(newItem);
        this.addItem(newItem);
      });
    }

    for (const [behaviorName, config] of this.behaviors) {
      let behavior = state.ItemBehaviorManager.get(behaviorName);
      if (!behavior) {
        return;
      }

      // behavior may be a boolean in which case it will be `behaviorName: true`
      config = config === true ? {} : config;
      behavior.attach(this, config);
    }
  }

  serialize() {
    return {
      entityReference: this.entityReference,
      inventory: this.inventory && this.inventory.serialize(),
    };
  }
}

module.exports = Item;
