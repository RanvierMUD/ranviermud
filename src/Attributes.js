'use strict';
const Attribute = require('./Attribute');

class Attributes extends Map
{
  constructor(data) {
    super();

    const baseStats = {
      strength: { base: 20 },
      agility: { base: 20 },
      intellect: { base: 20 },
      stamina: { base: 20 },
      health: { base: 100 },
      armor: { base: 0 },
    };

    // use base stats or use loaded stats but make sure it still has base stats
    if (!data) {
      data = baseStats;
    } else {
      for (const stat in baseStats) {
        if (!(stat in data)) {
          data[stat] = baseStats[stat];
        }
      }
    }

    for (let [statName, values] of Object.entries(data)) {
      if (typeof values !== 'object') {
        values = { base: values };
      }
      this.add(statName, values.base, values.delta || 0);
    }
  }

  add(name, base, delta = 0) {
    this.set(name, new Attribute(name, base, delta));
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
