'use strict';
const Attribute = require('./Attribute');

class Attributes extends Map
{
  constructor(data) {
    super();

    if (!data) {
      data = {
        strength: { base: 20 },
        agility: { base: 20 },
        intellect: { base: 20 },
        stamina: { base: 20 },
        health: { base: 100 },
        armor: { base: 0 },
      };
    }

    for (let [statName, values] of Object.entries(data)) {
      if (typeof values !== 'object') {
        values = { base: values };
      }
      const attribute = new Attribute(statName, values.base, values.delta || 0);
      this.set(statName, attribute);
    }
  }

  getAttributes() {
    return this.entries();
  }

  clearDeltas() {
    for (let [_, attr] of this) {
      attr.setDelta(0);
    }
  }

  serialize() {
    let data = {};
    [...this].forEach(([name, attribute]) => {
      data[name] = attribute.serialize();
    });

    return data;
  }
}

module.exports = Attributes;
