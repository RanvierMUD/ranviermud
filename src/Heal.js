'use strict';

const Damage = require('./Damage');

/**
 * Heal is `Damage` that raises an attribute instead of lowering it
 * @extends Damage
 */
class Heal extends Damage {
  /**
   * Raise a given attribute
   * @param {Character} target
   * @fires Character#heal
   * @fires Character#healed
   */
  commit(target) {
    this.finalAmount = this.evaluate(target);
    target.raiseAttribute(this.attribute, this.finalAmount);
    if (this.attacker) {
      /**
       * @event Character#heal
       * @param {Heal} heal
       * @param {Character} target
       */
      this.attacker.emit('heal', this, target);
    }
    /**
     * @event Character#healed
     * @param {Heal} heal
     */
    target.emit('healed', this);
  }
}

module.exports = Heal;
