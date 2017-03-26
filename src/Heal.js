'use strict';

const Damage = require('./Damage');

class Heal extends Damage {
  commit(target) {
    this.finalAmount = this.evaluate(target);
    target.raiseAttribute(this.attribute, this.finalAmount);
    if (this.attacker) {
      this.attacker.emit('heal', this, target);
    }
    target.emit('healed', this);
  }
}

module.exports = Heal;
