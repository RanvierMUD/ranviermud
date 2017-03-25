'use strict';

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
   * @param {string} attribute Attribute the damage is going to apply to
   * @param {number} amount
   * @param {?Character} attacker Character causing the damage
   * @param {?string} type Damage type e.g., physical, fire, etc.
   * @param {?string} source A damage source identifier. e.g., "skill:kick", "weapon", etc.
   */
  constructor(config) {
    const {
      attribute,
      amount = null,
      attacker = null,
      type = "physical",
      source = null,
      hidden = false
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
  }

  /**
   * @param {Character} target
   */
  evaluate(target) {
    let amount = this.amount;
    if (this.attacker) {
      amount = this.attacker.evaluateOutgoingDamage(this, amount);
    }

    return target.evaluateIncomingDamage(this, amount);
  }

  /**
   * @param {Character} target
   */
  commit(target) {
    this.finalAmount = this.evaluate(target);
    target.lowerAttribute(this.attribute, this.finalAmount);
    if (this.attacker) {
      this.attacker.emit('hit', this, target);
    }
    target.emit('damaged', this);
  }
}

module.exports = Damage;
