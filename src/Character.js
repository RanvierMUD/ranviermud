'use strict';

const Attributes = require('./Attributes');
const AttributeUtil = require('./AttributeUtil');
const EffectList = require('./EffectList');
const EquipSlotTakenError = require('./EquipErrors').EquipSlotTakenError;
const EventEmitter = require('events');
const Inventory = require('./Inventory');
const Parser = require('./CommandParser').CommandParser;
const RandomUtil = require('./RandomUtil');


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
    this.attributes = new Attributes(data.attributes || null);
    this.followers = new Set();
    this.following = null;

    this.effects = new EffectList(this, data.effects);
    this.skills = new Map();
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

  hasAttribute(attr) {
    return this.attributes.has(attr);
  }

  /**
   * Get current maximum value of attribute (as modified by effects.)
   * @param {string} attr
   * @return {number}
   */
  getMaxAttribute(attr) {
    const attribute = this.attributes.get(attr);

    // health and attackpower are calculated based off other stats
    // NOTE: This is an _example_ implementation based off WoW formulas
    switch (attribute.name) {
      case 'health':
        attribute.setBase(
          this.getMaxAttribute('stamina') * AttributeUtil.healthPerStamina(this.level)
        );
        break;
      case 'attackpower':
        attribute.setBase(this.getMaxAttribute('strength'));
        break;
      case 'energy':
      case 'armor':
        break;
      default:
        attribute.setBase(AttributeUtil.baseAttributeByLevel(attribute.name, this.level));
        break;
    }

    return this.effects.evaluateAttribute(attribute);
  }

  /* Get value of attribute including changes to the attribute.
   * @param {string} attr
   * @return {number}
  */
  getAttribute(attr) {
    return this.getMaxAttribute(attr) + this.attributes.get(attr).delta;
  }

  getBaseAttribute(attr) {
    return this.attributes.get(attr).base;
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

  addEffect(effect) {
    return this.effects.add(effect);
  }

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
   * @param {string} args
   * @param {Player} player
   * @return {Entity|null} Found entity... or not.
   */
  findCombatant(search) {
    if (!search.length) {
      return null;
    }

    let possibleTargets = this.room.npcs;
    if (this.getMeta('pvp')) {
      possibleTargets = possibleTargets.concat(this.room.players);
    }

    const target = Parser.parseDot(search, possibleTargets);

    if (!target) {
      return null;
    }

    if (!target.isNpc && !target.getMeta('pvp')) {
      throw new Error(`${target.name} has not opted into PvP.`);
    }

    if (target.pacifist) {
      throw new Error(`${target.name} is a pacifist and will not fight.`);
    }

    return target;
  }

  /**
   * @see EffectList.evaluateIncomingDamage
   * @param {Damage} damage
   * @return {number}
   */
  evaluateIncomingDamage(damage) {
    let amount = this.effects.evaluateIncomingDamage(damage);

    // let armor reduce incoming physical damage
    const attackerLevel = (damage.attacker && damage.attacker.level) || 1;
    const armor = this.getAttribute('armor');
    if (damage.type === 'physical' && armor > 0) {
      amount *= 1 - armor / (armor * AttributeUtil.getArmorReductionConstant(attackerLevel));
    }

    return Math.floor(amount);
  }

  /**
   * @see EffectList.evaluateOutgoingDamage
   * @param {Damage} damage
   * @return {number}
   */
  evaluateOutgoingDamage(damage) {
    return this.effects.evaluateOutgoingDamage(damage);
  }

  equip(item) {
    if (this.inventory) {
      this.removeItem(item);
    }
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
    this.inventory = this.inventory || new Inventory([]);
    this.inventory.addItem(item);
    item.belongsTo = this;
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
    item.belongsTo = null;
  }

  /**
   * Generate an amount of weapon damage
   * @return {number}
   */
  calculateWeaponDamage() {
    let amount = 0;
    let speed = this.getWeaponSpeed();
    const weapon = this.equipment.get('wield');
    if (!this.isNpc && weapon) {
      amount = RandomUtil.inRange(weapon.properties.minDamage, weapon.properties.maxDamage);
    }

    return Math.round(amount + this.getAttribute('strength') / 3.5 * speed);
  }

  getWeaponSpeed() {
    let speed = 2.0;
    const weapon = this.equipment.get('wield');
    if (!this.isNpc && weapon) {
      speed = weapon.properties.speed;
    }

    return speed;
  }

  follow(target) {
    if (target === this) {
      this.following = null;
      return;
    }

    this.following = target;
    target.addFollower(this);
  }

  unfollow() {
    this.following.removeFollower(this);
    this.following = null;
  }

  addFollower(follower) {
    this.followers.add(follower);
    follower.following = this;
  }

  removeFollower(target) {
    this.followers.delete(target);
    target.following = null;
  }

  isFollowing(target) {
    return this.following === target;
  }

  hasFollower(target) {
    return this.followers.has(target);
  }

  hydrate(state) {
    this.effects.hydrate(state);

    // inventory is hydrated in the subclasses because npc and players hydrate their inventories differently
  }

  /**
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

  getBroadcastTargets() {
    return [];
  }

  get isNpc() {
    return false;
  }
}

module.exports = Character;
