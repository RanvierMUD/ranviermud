const EventEmitter = require('events');
const uuid = require('node-uuid');
const ItemType = require('./ItemType');

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
        throw new ReferenceError(`Item in area [${area.name}] missing required property [${prop}]`)
      }
    }

    this.area = area;
    this.attributes  = item.attributes || {};
    this.behaviors   = item.behaviors || null;
    this.defaultInv  = item.defaultInv || null;
    this.description = item.description || 'Nothing special.';
    this.id          = item.id;
    this.globalId    = item.globalId; // EntityFactory key
    this.inventory   = item.inventory || new Map();
    this.isEquipped  = item.isEquipped || false;
    this.isHeld      = item.isHeld || false;
    this.keywords    = item.keywords;
    this.name        = item.name;
    this.room        = item.room || null;
    this.roomDesc    = item.roomDesc || '';
    this.script      = item.script || null;
    this.slot        = item.slot || null;
    this.type        = typeof item.type === 'string' ? ItemTypes.resolve(item.type) : (item.type || ItemType.OBJECT);
    this.uuid        = item.uuid || uuid.v4();
  }

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
    if (this.inventory === null) {
      this.inventory = new Map();
    }
    this.inventory.set(item.uuid, item);
  }

  removeItem(item) {
    this.inventory.delete(item.uuid);

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

    if (Array.isArray(this.inventory)) {
      if (!this.inventory.length) {
        this.inventory = null;
      }

      // TODO: repopulate any stored items on save
      // this.inventory.doStuff();
    }

    this.behaviors && this.behaviors.forEach(behaviorName => {
      let behavior = state.ItemBehaviorManager.get(behaviorName);
      if (!behavior) {
        return;
      }

      behavior.attach(this);
    });
  }

  serialize() {
    const data = {
      area: this.area.name,
      attributes: this.attributes,
      behaviors: this.behaviors,
      defaultInv: this.defaultInv,
      description: this.description,
      id: this.id,
      isEquipped: this.isEquipped,
      isHeld: this.isHeld,
      keywords: this.keywords,
      name: this.name,
      room: this.room ? this.room.id : null,
      roomDesc: this.roomDesc,
      script: this.script,
      slot: this.slot,
      type: this.type,
      uuid: this.uuid,
    };

    data.inventory = this.inventory ?
      Array.from(this.inventory.values()).map(item => item.serialize) :
      this.inventory
    ;

    return data;
  }

  getKey() {
    return this.area.name + ':' + this.id;
  }
}

module.exports = Item;
