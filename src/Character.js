'use strict';

const EffectMap = require('./EffectMap');
const EquipSlotTakenError = require('./EquipErrors').EquipSlotTakenError;
const EventEmitter = require('events');
const Inventory = require('./Inventory');
const Attributes = require('./Attributes');
const Config = require('./Config');


/**
 * @property {string}    name       Name shown on look/who/login
 * @property {Map}       inventory
 * @property {Set}       combatants Enemies this character is currently in combat with
 * @property {number}    level
 * @property {object}    attributes
 * @property {EffectMap} effects    List of current effects applied to the character
 * @property {Map}       skills     List of all character's skills
 * @property {Room}      room       Room the character is currently in
 */
class Character extends EventEmitter
{
  constructor(data) {
    super();

    this.name = data.name;
    this.inventory = new Inventory(data.inventory || []);
    this.equipment = data.equipment || new Map();
    this.combatants = new Set();
    this.combatData = {};
    this.level = data.level || 1;
    this.room = data.room || null;

    this.attributes = new Attributes(data.attributes || Config.get('defaultAttributes'));

    this.effects = new EffectMap(this);
    this.skills = new Map();
  }

  getAttributes() {
    var attrs = {};
    
    for (const [name, attr] of this.attributes) {
      attrs[name] = attr.serialize();
    }

    return attrs;
  }

  /**
   * Get current maximum value of attribute (as modified by effects.)
   * @param {string} attr
   * @return {number}
   */
  getMaxAttribute(attr) {
    const attribute = this.attributes.get(attr);
    return this.effects.evaluate(attribute);
  }

  /* Get value of attribute including changes to the attribute.
   * @param {string} attr
   * @return {number}
  */
  getAttribute(attr) {
    return this.getMaxAttribute(attr) + this.attributes.get(attr).delta;
  }

  /* Clears any changes to the attribute, setting it to its base value.
   * @param {string} attr
   * @return void
  */
  setAttributeToMax(attr) {
    this.attributes.get(attr).setDelta(0);
  }

  /* Adds to the delta of the attribute
   * @param {string} attr
   * @param {number} amount
   * @return void
  */
  raiseAttribute(attr, amount) {
    this.attributes.get(attr).raise(amount);
  }

  lowerAttribute(attr, amount) {
    this.attributes.get(attr).lower(amount);
  }

  hasEffect(effectType) {
    return this.effects.has(effectType);
  }

  addEffect(effect) {
    this.effects.set(effect.type, effect);
  }

  removeEffect(effectType) {
    this.effects.delete(effectType);
  }

  /**
   * Check to see if this character is currently in combat or if they are
   * currently in combat with a specific character
   * @param {?Character} target
   * @return boolean
   */
  isInCombat(target) {
    return target ? this.combatants.has(target) : this.combatants.size > 0;
  }

  /**
   * @param {Character} target
   */
  addCombatant(target) {
    if (this.isInCombat(target)) {
      return;
    }

    this.combatants.add(target);
  }

  /**
   * @param {Character} target
   */
  removeCombatant(target) {
    if (!this.combatants.has(target)) {
      return;
    }

    this.combatants.delete(target);
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
  }
}

module.exports = Character;
