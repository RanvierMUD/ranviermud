'use strict';

const Random = require('./RandomUtil');

/**
 * @property {string} attribute Attribute the damage is going to apply to
 * @property {number} amount Initial amount of damage to be done
 * @property {?Character} attacker Character causing the damage
 * @property {?string} type Damage type e.g., physical, fire, etc.
 * @property {?string} source A damage source identifier. e.g., "skill:kick", "weapon", etc.
 * @property {number} finalAmount Amount of damage to be done after attacker/defender effects
 */
class Damage {
  /**
   * @param {Object} config
   * @param {string} config.attribute Attribute the damage is going to apply to
   * @param {number} [config.amount=null]
   * @param {Character} [config.attacker=null] Character causing the damage
   * @param {string} [config.type="physical"] Damage type e.g., physical, fire, etc.
   * @param {string} [config.source=null] A damage source identifier. e.g., "skill:kick", "weapon", etc.
   * @param {boolean} [config.hidden=false]
   */
  constructor(config) {
    const {
      attribute,
      amount = null,
      attacker = null,
      type = "physical",
      source = null,
      hidden = false,
      critical = false,
      criticalMultiplier = 1.5
    } = config;

    if (amount === null) {
      throw new TypeError("Damage amount null");
    }

    if (attribute === null) {
      throw new TypeError("Damage attribute null");
    }

    this.attribute = attribute;
    this.type = type;
    this.amount = this.finalAmount = amount;
    this.source = source;
    this.attacker = attacker;
    this.hidden = hidden;
    this.critical = critical;
    this.criticalMultiplier = criticalMultiplier;
  }

  /**
   * Evaluate actual damage taking attacker/target's effects into account
   * @param {Character} target
   * @return {number} Final damage amount
   */
  evaluate(target) {
    let amount = this.amount;

    if (this.attacker) {
      const critChance = Math.max(this.attacker.getMaxAttribute('critical') || 0, 0);
      this.critical = Random.probability(critChance);
      if (this.critical) {
        amount = Math.ceil(amount * this.criticalMultiplier);
      }
      amount = this.attacker.evaluateOutgoingDamage(this, amount);
    }

    return target.evaluateIncomingDamage(this, amount);
  }

  /**
   * Actually lower the attribute
   * @param {Character} target
   * @fires Character#hit
   * @fires Character#damaged
   */
  commit(target) {
    this.finalAmount = this.evaluate(target);
    target.lowerAttribute(this.attribute, this.finalAmount);
    if (this.attacker) {
      /**
       * @event Character#hit
       * @param {Damage} damage
       * @param {Character} target
       */
      this.attacker.emit('hit', this, target);
    }
      /**
       * @event Character#damaged
       * @param {Damage} damage
       */
    target.emit('damaged', this);
  }
}

module.exports = Damage;
