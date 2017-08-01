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
   * `baseStats` argument should adhere to the following format:
   *
   *     {
   *       statName: 10, // where 10 is your preferred base value
   *       ...
   *     }
   *
   * When stats are loaded from disk, however, they will follow this format:
   *
   *     {
   *       statName: {
   *         base: 10,
   *         delta: 0
   *       }
   *     }
   *
   * So technically either format is valid but the former is easier when setting initial defaults
   *
   * @param {Object} baseStats Override for default attribute set
   */
  constructor(baseStats) {
    super();

    baseStats = baseStats || {
      health: { base: 100 },
    };

    for (const attr in baseStats) {
      const attrConfig = baseStats[attr];
      if (typeof attrConfig === 'number') {
        baseStats[attr] = { base: attrConfig };
      }

      if (typeof baseStats[attr] !== 'object' || !('base' in baseStats[attr])) {
        throw new Error('Invalid base value given to attributes.\n' + JSON.stringify(baseStats, null, 2));
      }
    }

    for (let [statName, values] of Object.entries(baseStats)) {
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
