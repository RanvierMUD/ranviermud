'use strict';

const Damage = require('./Damage');

class Heal extends Damage {
  commit(target) {
    this.finalAmount =  this.evaluate(target);
    target.raiseAttribute(this.attribute, this.finalAmount);
    target.emit('healed', this);
  }
}

module.exports = Heal;
