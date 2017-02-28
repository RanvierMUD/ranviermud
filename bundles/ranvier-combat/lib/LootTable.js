'use strict';

const Random = require('../../../src/RandomUtil');

class LootTable {
  constructor(config) {
    this.table = new Map(Object.entries(config.table || {}));
    this.options = Object.assign({
      maxItems: 5
    }, config.options || {});
  }

  roll() {
    let items = [];
    for (const [item, chance] of this.table) {
      if (Random.probability(chance)) {
        items.push(item);
      }

      if (items.length >= this.options.maxItems) {
        break;
      }
    }

    return items;
  }
}

module.exports = LootTable;
