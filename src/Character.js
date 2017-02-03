'use strict';

const EventEmitter = require('events');
const EffectMap = require('./EffectMap');
const EquipSlotTakenError = require('./EquipErrors').EquipSlotTakenError;

/**
 * @property {string} name      Name shown on look/who/login
 * @property {Map}    inventory
 * @property {boolean|Character} inCombat Character they are in combat with
 * @property {number}    level
 * @property {object}    attributes
 * @property {EffectMap} effects List of current effects applied to the character
 * @property {Map}       skills     List of all character's skills
 * @property {Room}      room       Room the character is currently in
 */
class Character extends EventEmitter
{
  constructor(data) {
    super();

    this.name = data.name;
    this.inventory = data.inventory || new Map();
    this.equipment = data.equipment || new Map();
    this.inCombat = false;
    this.level = data.level || 1;
    this.room = data.room || null;

    // TODO: Maybe move default attributes out somewhere?
    this.attributes = data.attributes || {

      maxHealth: 100,
      health:    100,
      maxMana:   200,
      mana:      200,
      maxEnergy: 200,
      energy:    200,

      strength:     20,
      intelligence: 20,
      wisdom:       20,
      dexterity:    20,
      constitution: 20,
    };

    this.effects = new EffectMap(this);
    this.skills = new Map();
  }

  getAttributes() {
      var attrs = Object.assign({}, this.attributes);
      for (const attr in attrs) {
        attrs[attr] = this.getAttribute(attr);
      }

      return attrs;
  }

  /**
   * Get current value of attribute (as modified by effects)
   * @param {string} attr
   * @return {number}
   */
  getAttribute(attr) {
    return this.effects.evaluateAttribute(attr);
  }

  getRawAttribute(attr) {
    return this.attributes[attr];
  }

  hasEffect(effectType) {
    return this.effects.has(type);
  }

  addEffect(effect) {
    this.effects.set(effect.type, effect);
  }

  removeEffect(effectType) {
    this.effects.delete(effectType);
  }

  equip(item) {
    this.removeItem(item);
    if (this.equipment.has(item.slot)) {
      throw new EquipSlotTakenError();
    }

    this.equipment.set(item.slot, item);
    item.isEquipped = true;
  }

  unequip(slot) {
    const item = this.equipment.get(slot);
    item.isEquipped = false;
    this.equipment.delete(slot);
    this.addItem(item);
  }

  addItem(item) {
    if (this.inventory === null) {
      this.inventory = new Map();
    }
    this.inventory.set(item.uuid, item);
    item.isHeld = true;
  }

  removeItem(item) {
    this.inventory.delete(item.uuid);
    item.isHeld = false;

    // if we removed the last item unset the inventory
    // This ensures that when it's reloaded it won't try to set
    // its default inventory. Instead it will persist the fact
    // that all the items were removed from it
    if (!this.inventory.size) {
      this.inventory = null;
    }
  }

  hydrate(state) {
    // TODO: repopulate any stored items on save
    // this.inventory.doStuff();
    // this.equipment.doStuff();
  }
}

module.exports = Character;
