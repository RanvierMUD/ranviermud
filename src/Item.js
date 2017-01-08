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
 * @property {number}  maxLoad     Max number of these items allowed to be in the game at one time
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
    this.attributes  = item.attributes  || {};
    this.behaviors   = item.behaviors   || null;
    this.defaultInv  = item.defaultInv  || null;
    this.description = item.description || 'Nothing special.';
    this.id          = item.id;
    this.inventory   = new Map();
    this.isEquipped  = item.isEquipped  || false;
    this.isHeld      = item.isHeld      || false;
    this.keywords    = item.keywords;
    this.maxLoad     = item.maxLoad;
    this.name        = item.name;
    this.room        = item.room        || null;
    this.roomDesc    = item.roomDesc || '';
    this.script      = item.script      || null;
    this.type        = typeof item.type === 'string' ? ItemTypes.resolve(item.type) : (item.type || ItemType.OBJECT);
    this.uuid        = item.uuid        || uuid.v4();
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
    this.inventory.set(item.uuid, item);
  }

  removeItem(item) {
    this.inventory.delete(item.uuid);
  }

  serialize() {
    const data = {
      area: area.name,
      attributes,
      behaviors,
      defaultInv,
      description,
      id,
      isEquipped,
      isHeld,
      keywords,
      maxLoad,
      name,
      room: room.id,
      roomDesc,
      script,
      type,
      uuid,
    } = this;
    data.inventory = Array.from(this.inventory.values()).map(item => item.serialize);

    return data;
  }
}

module.exports = Item;
