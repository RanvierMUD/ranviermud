'use strict';
const Attribute = require('./Attribute');

class Attributes extends Map
{
  constructor(data) {
    super();

    data = data || {};

    const baseStats = {
      strength: 20,
      agility: 20,
      intellect: 20,
      stamina: 20,
      health: 100,
      energy: 100,
      armor: 0
    };

    for (const stat in baseStats) {
      const statData = {
        base: (data[stat] && data[stat].base) || baseStats[stat],
        delta: (data[stat] && data[stat].delta) || 0,
      };
      const attribute = new Attribute(stat, statData.base, statData.delta);
      this.set(stat, attribute);
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
