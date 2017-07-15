'use strict';

/**
 * Representation of an "Attribute" which is any value that has a base amount and depleted/restored
 * safely. Where safely means without being destructive to the base value.
 *
 * An attribute on its own cannot be raised above its base value. To raise attributes above their
 * base temporarily see the {@link http://ranviermud.com/extending/effects|Effect guide}.
 *
 * @property {string} name
 * @property {number} base
 * @property {number} delta Current difference from the base
 */
class Attribute {
  /**
   * @param {string} name
   * @param {number} base
   * @param {number} delta=0
   */
  constructor(name, base, delta = 0) {
    if (isNaN(base)) { 
      throw new TypeError(`Base attribute must be a number, got ${base}.`); 
    }
    if (isNaN(delta)) {
      throw new TypeError(`Attribute delta must be a number, got ${delta}.`);
    }
    this.name = name;
    this.base = base;
    this.delta = delta;
  }

  /**
   * Lower current value
   * @param {number} amount
   */
  lower(amount) {
    this.raise(-amount);
  }

  /**
   * Raise current value
   * @param {number} amount
   */
  raise(amount) {
    const newDelta = Math.min(this.delta + amount, 0);
    this.delta = newDelta;
  }

  /**
   * Change the base value
   * @param {number} amount
   */
  setBase(amount) {
    this.base = Math.max(amount, 0);
  }

  /**
   * Bypass raise/lower, directly setting the delta
   * @param {amount}
   */
  setDelta(amount) {
    this.delta = Math.min(amount, 0);
  }

  serialize() {
    const { delta, base } = this;
    return { delta, base };
  }
}

module.exports = Attribute;
