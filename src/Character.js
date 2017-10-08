'use strict';

const Attributes = require('./Attributes');
const Config = require('./Config');
const EffectList = require('./EffectList');
const EquipSlotTakenError = require('./EquipErrors').EquipSlotTakenError;
const EventEmitter = require('events');
const Heal = require('./Heal');
const { Inventory, InventoryFullError } = require('./Inventory');
const Parser = require('./CommandParser').CommandParser;


/**
 * The Character class acts as the base for both NPCs and Players. It is _opinionated_
 * about how stats are calculated (see getMaxAttribute), if you want to change what
 * stats a player has and how they are calculated it should be changed here and in
 * `Attributes.js`
 *
 * @property {string}    name       Name shown on look/who/login
 * @property {Map}       inventory
 * @property {Set}       combatants Enemies this character is currently in combat with
 * @property {number}    level
 * @property {object}    attributes
 * @property {EffectList} effects    List of current effects applied to the character
 * @property {Map}       skills     List of all character's skills
 * @property {Room}      room       Room the character is currently in
 * @implements {Broadcastable}
 * @extends EventEmitter
 */
class Character extends EventEmitter
{
  constructor(data) {
    super();

    this.name = data.name;
    this.inventory = new Inventory(data.inventory || {});
    this.equipment = data.equipment || new Map();
    this.combatants = new Set();
    this.combatData = {};
    this.level = data.level || 1;
    this.room = data.room || null;
    this.attributes = new Attributes(data.attributes || null);

    this.followers = new Set();
    this.following = null;
    this.party = null;

    this.effects = new EffectList(this, data.effects);
    this.skills = new Map();

    // Arbitrary data bundles are free to shove whatever they want in
    // WARNING: values must be JSON.stringify-able
    this.metadata = data.metadata || {};
  }

  /**
   * Proxy all events on the player to effects
   * @param {string} event
   * @param {...*}   args
   */
  emit(event, ...args) {
    super.emit(event, ...args);

    this.effects.emit(event, ...args);
  }

  /**
   * Set a metadata value. Does _not_ autovivify, you will need to create the parent objects if they don't exist
   * @param {string} key   Key to set. Supports dot notation e.g., `"foo.bar"`
   * @param {*}      value Value must be JSON.stringify-able
   */
  setMeta(key, value) {
    let parts = key.split('.');
    const property = parts.pop();
    let base = this.metadata;

    while (parts.length) {
      let part = parts.pop();
      if (!(part in base)) {
        throw new RangeError(`Metadata path invalid: ${key}`);
      }
      base = base[part];
    }

    base[property] = value;
  }

  /**
   * Get metadata about a player
   * @param {string} key Key to fetch. Supports dot notation e.g., `"foo.bar"`
   * @return {*}
   */
  getMeta(key) {
    let base = this.metadata;
    return key.split('.').reduce((obj, index) => obj && obj[index], base);
  }

  /**
   * @param {string} attr Attribute name
   * @return {boolean}
   */
  hasAttribute(attr) {
    return this.attributes.has(attr);
  }

  /**
   * Get current maximum value of attribute (as modified by effects.)
   * @param {string} attr
   * @return {number}
   */
  getMaxAttribute(attr) {
    if (this.hasAttribute(attr)) {
      const attribute = this.attributes.get(attr);
      return this.effects.evaluateAttribute(attribute);
    }
    return null;
  }

  /**
   * @see {@link Attributes#add}
   */
  addAttribute(name, base, delta = 0) {
    this.attributes.add(name, base, delta);
  }

  /**
   * Get the current value of an attribute (base modified by delta)
   * @param {string} attr
   * @return {number}
  */
  getAttribute(attr) {
    if (this.hasAttribute(attr)) {
      return this.getMaxAttribute(attr) + this.attributes.get(attr).delta;
    }
    return null;
  }

  /**
   * Get the base value for a given attribute
   * @param {string} attr Attribute name
   * @return {number}
   */
  getBaseAttribute(attr) {
    var attr = this.attributes.get(attr);
    return attr && attr.base;
  }

  /**
   * Clears any changes to the attribute, setting it to its base value.
   * @param {string} attr
  */
  setAttributeToMax(attr) {
    this.attributes.get(attr).setDelta(0);
  }

  /**
   * Raise an attribute by name
   * @param {string} attr
   * @param {number} amount
   * @see {@link Attributes#raise}
  */
  raiseAttribute(attr, amount) {
    this.attributes.get(attr).raise(amount);
  }

  /**
   * Lower an attribute by name
   * @param {string} attr
   * @param {number} amount
   * @see {@link Attributes#lower}
  */
  lowerAttribute(attr, amount) {
    this.attributes.get(attr).lower(amount);
  }

  /**
   * Update an attribute's base value. 
   *
   * NOTE: You _probably_ don't want to use this the way you think you do. You should not use this
   * for any temporary modifications to an attribute, instead you should use an Effect modifier.
   *
   * This will _permanently_ update the base value for an attribute to be used for things like a
   * player purchasing a permanent upgrade or increasing a stat on level up
   *
   * @param {string} attr Attribute name
   * @param {number} newBase New base value
   */
  setAttributeBase(attr, newBase) {
    this.attributes.get(attr).setBase(newBase);
  }

  /**
   * @param {string} type
   * @return {boolean}
   * @see {@link Effect}
   */
  hasEffectType(type) {
    return this.effects.hasEffectType(type);
  }

  /**
   * @param {Effect} effect
   * @return {boolean}
   */
  addEffect(effect) {
    return this.effects.add(effect);
  }

  /**
   * @param {Effect} effect
   * @see {@link Effect#remove}
   */
  removeEffect(effect) {
    this.effects.remove(effect);
  }

  /**
   * Start combat with a given target.
   * @param {Character} target
   * @param {?number}   lag    Optional milliseconds of lag to apply before the first attack
   */
  initiateCombat(target, lag = 0) {
    if (!this.isInCombat()) {
      this.combatData.lag = lag;
      this.combatData.roundStarted = Date.now();
      this.emit('combatStart');
    }

    // this doesn't use `addCombatant` because `addCombatant` automatically
    // adds this to the target's combatants list as well
    this.combatants.add(target);
    if (!target.isInCombat()) {
      target.initiateCombat(this, 2500);
    }

    target.addCombatant(this);
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
    target.addCombatant(this);
  }

  /**
   * @param {Character} target
   */
  removeCombatant(target) {
    if (!this.combatants.has(target)) {
      return;
    }

    this.combatants.delete(target);
    target.removeCombatant(this);

    if (!this.combatants.size) {
      this.emit('combatEnd');
    }
  }

  /**
   * Fully remove this character from combat
   */
  removeFromCombat() {
    if (!this.isInCombat()) {
      return;
    }

    for (const combatant of this.combatants) {
      this.removeCombatant(combatant);
    }
  }

  /**
   * @see EffectList.evaluateIncomingDamage
   * @param {Damage} damage
   * @return {number}
   */
  evaluateIncomingDamage(damage, currentAmount) {
    let amount = this.effects.evaluateIncomingDamage(damage, currentAmount);
    return Math.floor(amount);
  }

  /**
   * @see EffectList.evaluateOutgoingDamage
   * @param {Damage} damage
   * @param {number} currentAmount
   * @return {number}
   */
  evaluateOutgoingDamage(damage, currentAmount) {
    return this.effects.evaluateOutgoingDamage(damage, currentAmount);
  }

  equip(item) {
    if (this.equipment.has(item.slot)) {
      throw new EquipSlotTakenError();
    }

    if (this.inventory) {
      this.removeItem(item);
    }

    this.equipment.set(item.slot, item);
    item.isEquipped = true;
    item.belongsTo = this;
    item.emit('equip', this);
    this.emit('equip', item.slot, item);
  }

  /**
   * Remove equipment in a given slot and move it to the character's inventory
   * @param {string} slot
   */
  unequip(slot) {
    if (this.isInventoryFull()) {
      throw new InventoryFullError();
    }

    const item = this.equipment.get(slot);
    item.isEquipped = false;
    this.equipment.delete(slot);
    item.emit('unequip', this);
    this.emit('unequip', slot, item);
    this.addItem(item);
  }

  /**
   * Move an item to the character's inventory
   * @param {Item} item
   */
  addItem(item) {
    this._setupInventory();
    this.inventory.addItem(item);
    item.belongsTo = this;
  }

  /**
   * Remove an item from the character's inventory. Warning: This does not automatically place the
   * item in any particular place. You will need to manually add it to the room or another
   * character's inventory
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
   * Check to see if this character has a particular item by EntityReference
   * @param {EntityReference} itemReference
   * @return {Item|boolean}
   */
  hasItem(itemReference) {
    for (const [ uuid, item ] of this.inventory) {
      if (item.entityReference === itemReference) {
        return item;
      }
    }

    return false;
  }

  /**
   * @return {boolean}
   */
  isInventoryFull() {
    this._setupInventory();
    return this.inventory.isFull;
  }

  /**
   * @private
   */
  _setupInventory() {
    this.inventory = this.inventory || new Inventory();
    // Default max inventory size config
    if (!this.isNpc && !isFinite(this.inventory.getMax())) {
      this.inventory.setMax(Config.get('defaultMaxPlayerInventory') || 20);
    }
  }

  /**
   * Begin following another character. If the character follows itself they stop following.
   * @param {Character} target
   */
  follow(target) {
    if (target === this) {
      this.unfollow();
      return;
    }

    this.following = target;
    target.addFollower(this);
  }

  /**
   * Stop following whoever the character was following
   */
  unfollow() {
    this.following.removeFollower(this);
    this.following = null;
  }

  /**
   * @param {Character} follower
   */
  addFollower(follower) {
    this.followers.add(follower);
    follower.following = this;
  }

  /**
   * @param {Character} target
   */
  removeFollower(target) {
    this.followers.delete(target);
    target.following = null;
  }

  /**
   * @param {Character} target
   * @return {boolean}
   */
  isFollowing(target) {
    return this.following === target;
  }

  /**
   * @param {Character} target
   * @return {boolean}
   */
  hasFollower(target) {
    return this.followers.has(target);
  }

  /**
   * Initialize the character from storage
   * @param {GameState} state
   */
  hydrate(state) {
    this.effects.hydrate(state);

    // inventory is hydrated in the subclasses because npc and players hydrate their inventories differently
  }

  /**
   * Gather data to be persisted
   * @return {Object}
   */
  serialize() {
    return {
      attributes: this.attributes.serialize(),
      level: this.level,
      name: this.name,
      room: this.room.entityReference,
      effects: this.effects.serialize(),
    };
  }

  /**
   * @see {@link Broadcastable}
   * @see {@link Broadcast}
   */
  getBroadcastTargets() {
    return [];
  }

  /**
   * @return {boolean}
   */
  get isNpc() {
    return false;
  }
}

module.exports = Character;
