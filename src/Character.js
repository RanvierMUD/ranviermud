'use strict';

const Attributes = require('./Attributes');
const EffectList = require('./EffectList');
const EquipSlotTakenError = require('./EquipErrors').EquipSlotTakenError;
const EventEmitter = require('events');
const Inventory = require('./Inventory');
const Parser = require('./CommandParser').CommandParser;
const RandomUtil = require('./RandomUtil');


/**
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
          this.getMaxAttribute('stamina') * healthPerStamina(this.level)
        );
        break;
      case 'attackpower':
        attribute.setBase(this.getMaxAttribute('strength'));
        break;
      case 'energy':
      case 'armor':
        break;
      default:
        attribute.setBase(baseAttributeByLevel(attribute.name, this.level));
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
      amount *= 1 - armor / (armor * getArmorReductionConstant(attackerLevel));
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

function healthPerStamina(level) {
  level = parseInt(level, 10);
  const map = [
    0, 14, 14, 15, 16, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19,
    19, 20, 20, 20, 20, 22, 22, 22, 22, 24, 24, 24, 24, 25, 25, 26, 26, 26, 26,
    28, 28, 28, 28, 29, 29, 30, 30, 31, 31, 32, 32, 33, 33, 33, 34, 34, 34, 35,
    35, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 37, 37, 37, 37, 37, 37, 38, 39,
    40, 42, 42, 43, 43, 43, 44, 46, 47, 48, 48, 48, 49, 49, 49, 53, 55, 58, 60,
    60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60
  ]
  return level in map ? map[level] : 1;
}

function baseAttributeByLevel(name, level) {
  var index = ({
    strength: 0,
    agility: 1,
    stamina: 2,
    intellect: 3,
  })[name];

  var bases = {
    0: [ 0, 0, 0, 0 ],
    1: [ 17, 10, 11, 8 ],
    2: [ 19, 12, 12, 9 ],
    3: [ 20, 12, 12, 10 ],
    4: [ 21, 13, 13, 10 ],
    5: [ 21, 13, 13, 10 ],
    6: [ 21, 13, 13, 10 ],
    7: [ 23, 14, 14, 11 ],
    8: [ 24, 15, 15, 12 ],
    9: [ 26, 16, 16, 12 ],
    10: [ 27, 17, 17, 13 ],
    11: [ 30, 18, 18, 14 ],
    12: [ 33, 20, 20, 16 ],
    13: [ 35, 21, 22, 17 ],
    14: [ 38, 24, 24, 18 ],
    15: [ 41, 25, 25, 20 ],
    16: [ 44, 27, 27, 21 ],
    17: [ 47, 28, 29, 23 ],
    18: [ 51, 31, 31, 25 ],
    19: [ 54, 33, 33, 26 ],
    20: [ 56, 35, 35, 27 ],
    21: [ 59, 36, 36, 29 ],
    22: [ 63, 39, 39, 31 ],
    23: [ 66, 40, 41, 32 ],
    24: [ 70, 43, 43, 34 ],
    25: [ 73, 45, 45, 35 ],
    26: [ 76, 46, 47, 37 ],
    27: [ 79, 48, 48, 38 ],
    28: [ 83, 51, 51, 40 ],
    29: [ 86, 53, 53, 42 ],
    30: [ 88, 54, 54, 43 ],
    31: [ 91, 56, 56, 44 ],
    32: [ 94, 57, 58, 46 ],
    33: [ 97, 60, 59, 47 ],
    34: [ 102, 62, 63, 50 ],
    35: [ 105, 64, 64, 51 ],
    36: [ 108, 66, 66, 53 ],
    37: [ 111, 68, 68, 54 ],
    38: [ 114, 69, 70, 55 ],
    39: [ 116, 71, 71, 57 ],
    40: [ 121, 73, 74, 59 ],
    41: [ 123, 75, 76, 60 ],
    42: [ 126, 77, 77, 61 ],
    43: [ 129, 79, 79, 63 ],
    44: [ 132, 80, 81, 64 ],
    45: [ 136, 83, 83, 66 ],
    46: [ 140, 86, 86, 68 ],
    47: [ 143, 87, 88, 70 ],
    48: [ 146, 89, 89, 71 ],
    49: [ 148, 91, 91, 72 ],
    50: [ 151, 93, 93, 74 ],
    51: [ 154, 94, 94, 75 ],
    52: [ 158, 97, 97, 77 ],
    53: [ 161, 98, 99, 78 ],
    54: [ 164, 100, 100, 80 ],
    55: [ 167, 102, 102, 81 ],
    56: [ 171, 105, 105, 83 ],
    57: [ 174, 106, 106, 85 ],
    58: [ 176, 108, 108, 86 ],
    59: [ 179, 109, 110, 87 ],
    60: [ 183, 112, 112, 89 ],
    61: [ 196, 120, 120, 96 ],
    62: [ 208, 127, 128, 102 ],
    63: [ 221, 135, 135, 108 ],
    64: [ 224, 137, 137, 109 ],
    65: [ 228, 139, 140, 111 ],
    66: [ 231, 141, 141, 113 ],
    67: [ 234, 143, 143, 114 ],
    68: [ 236, 145, 145, 115 ],
    69: [ 239, 146, 146, 117 ],
    70: [ 252, 154, 154, 123 ],
    71: [ 259, 158, 158, 126 ],
    72: [ 271, 166, 166, 132 ],
    73: [ 284, 174, 174, 139 ],
    74: [ 287, 175, 175, 140 ],
    75: [ 289, 177, 177, 141 ],
    76: [ 292, 179, 179, 143 ],
    77: [ 296, 181, 181, 145 ],
    78: [ 299, 183, 183, 146 ],
    79: [ 303, 186, 186, 148 ],
    80: [ 309, 189, 189, 151 ],
    81: [ 322, 197, 197, 157 ],
    82: [ 334, 204, 204, 163 ],
    83: [ 341, 208, 209, 167 ],
    84: [ 344, 211, 210, 168 ],
    85: [ 347, 212, 212, 169 ],
    86: [ 359, 220, 220, 175 ],
    87: [ 372, 227, 227, 182 ],
    88: [ 384, 235, 235, 188 ],
    89: [ 397, 242, 243, 194 ],
    90: [ 409, 250, 250, 200 ],
    91: [ 560, 343, 343, 274 ],
    92: [ 662, 405, 405, 324 ],
    93: [ 775, 474, 474, 379 ],
    94: [ 908, 555, 555, 444 ],
    95: [ 1066, 652, 652, 521 ],
    96: [ 1254, 767, 767, 613 ],
    97: [ 1304, 797, 797, 638 ],
    98: [ 1355, 828, 828, 662 ],
    99: [ 1405, 859, 859, 687 ],
    100: [ 1455, 889, 890, 711 ],
    101: [ 3971, 2426, 2429, 1941 ],
    102: [ 4547, 2778, 2781, 2222 ],
    103: [ 5201, 3178, 3182, 2542 ],
    104: [ 5895, 3602, 3606, 2881 ],
    105: [ 6478, 3958, 3962, 3165 ],
    106: [ 7105, 4341, 4346, 3472 ],
    107: [ 7740, 4729, 4734, 3782 ],
    108: [ 8491, 5188, 5194, 4149 ],
    109: [ 9323, 5697, 5703, 4556 ],
    110: [ 10232, 6252, 6259, 5000 ]
  }

  if (!(level in bases)) {
    level = 1;
  }

  return bases[level][index];
}

function getArmorReductionConstant(level) {
  const map = [
    0, 157, 167, 177, 187, 197, 207, 217, 227, 237, 247, 257, 267, 277, 287, 297, 307, 317,
    327, 337, 347, 357, 367, 377, 387, 397, 407, 417, 427, 437, 447, 457, 467, 477, 487,
    497, 507, 517, 527, 537, 547, 557, 567, 577, 587, 597, 607, 617, 627, 637, 647, 657,
    667, 677, 687, 697, 707, 717, 727, 737, 747, 757, 767, 777, 787, 797, 807, 817, 827,
    837, 847, 857, 867, 877, 887, 897, 907, 917, 927, 937, 947, 957, 967, 977, 987, 997,
    1007, 1017, 1027, 1037, 1047, 1185, 1342, 1518, 1718, 1945, 2201, 2491, 2819, 3190,
    3610, 5435, 5613, 5799, 5994, 6199, 6415, 6642, 6880, 7132, 7390, 7648, 7906, 8164
  ];

  return map[level] || 0;
}
