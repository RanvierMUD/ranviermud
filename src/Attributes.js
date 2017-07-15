'use strict';
const Attribute = require('./Attribute');

/**
 * Container for a list of attributes for a {@link Character}
 *
 * Note: this currently defines the default list of attributes for Characters and should probably
 * be refactored to allow for bundles to define this list instead
 *
 * @extends Map
 */
class Attributes extends Map
{
  /**
   * @param {Object} data Override for default attribute set
   */
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

  /**
   * Creates and adds an attribute of a given name to the list
   *
   * @param {string} name
   * @param {number} base
   * @param {number} delta=0
   */
  add(name, base, delta = 0) {
    this.set(name, new Attribute(name, base, delta));
  }

  /**
   * @return {Array} see {@link Map#entries}
   */
  getAttributes() {
    return this.entries();
  }

  /**
   * Clear all deltas for all attributes in the list
   */
  clearDeltas() {
    for (let [_, attr] of this) {
      attr.setDelta(0);
    }
  }

  /**
   * Gather data that will be persisted
   * @return {Object}
   */
  serialize() {
    let data = {};
    [...this].forEach(([name, attribute]) => {
      data[name] = attribute.serialize();
    });

    return data;
  }
}

module.exports = Attributes;
