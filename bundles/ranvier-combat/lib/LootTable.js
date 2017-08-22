'use strict';

const Random = require('../../../src/RandomUtil');
const Data = require('../../../src/Data');
const Logger = require('../../../src/Logger');

let loadedPools = {};

/**
 * A loot table is made up of one or more loot pools. The `roll()` method will
 * determine drops from the pools up to `maxItems` drops
 */
class LootTable {
  /**
   * See bundles/ranvier-areas/areas/limbo/npcs.yml for example of usage
   * @param {Array<PoolReference|Object>} config.pools List of pool references or pool definitions
   */
  constructor(state, config) {
    this.pools = config.pools || [];
    this.currencyRanges = config.currencies || null;

    this.options = Object.assign({
      maxItems: 5
    }, config.options || {});

    this.pools = this.pools
      .map(pool => this.resolvePool(state, pool))
      .reduce((acc, val) => acc.concat(val), [])
    ;
  }

  roll() {
    let items = [];
    for (const pool of this.pools) {
      if (!(pool instanceof Map)) {
        continue;
      }

      if (items.length >= this.options.maxItems) {
        break;
      }

      for (const [item, chance] of pool) {
        if (Random.probability(chance)) {
          items.push(item);
        }

        if (items.length >= this.options.maxItems) {
          break;
        }
      }
    }

    return items;
  }

  /**
   * Find out how much of the different currencies this NPC will drop
   * @return {Array<{{name: string, amount: number}}>}
   */
  currencies() {
    if (!this.currencyRanges) {
      return null;
    }

    let result = [];
    for (const currency in this.currencyRanges) {
      const entry = this.currencyRanges[currency];
      const amount = Random.inRange(entry.min, entry.max);
      if (amount) {
        result.push({
          name: currency,
          amount
        });
      }
    }

    return result;
  }

  resolvePool(state, pool) {
    if (typeof pool !== 'string') {
      // pool is a ready-built pool definition
      return [new Map(Object.entries(pool))];
    }

    // otherwise pool entry is: "myarea:foopool" so try to load loot-pools.yml from the appropriate area
    const poolArea = state.AreaManager.getAreaByReference(pool);
    if (!poolArea) {
      Logger.error(`Invalid item pool area: ${pool}`);
      return null;
    }

    const areaPath = state.AreaManager.getAreaByReference(pool).areaPath;
    const poolsPath = __dirname + '/../../' + areaPath + '/loot-pools.yml';
    if (!loadedPools[poolArea.name]) {
      try {
        loadedPools[poolArea.name] = Data.parseFile(poolsPath);
      } catch (e) {
        return Logger.error(`Area has no pools definition: ${pool} - ${poolsPath}`);
      }
    }
    let availablePools = loadedPools[poolArea.name];

    const [, poolName] = pool.split(':');

    if (!(poolName in availablePools)) {
      Logger.error(`Area item pools does not include ${poolName}`);
      return null;
    }

    const resolvedPool = availablePools[poolName];
    // resolved pool is just a single pool definition
    if (!Array.isArray(resolvedPool)) {
      pool = resolvedPool;
    } else {
      // resolved pool is a meta pool (pool of pools) so recursively resolve it
      pool = resolvedPool
        .map(nestedPool => this.resolvePool(state, nestedPool))
        .reduce((acc, val) => acc.concat(val), [])
      ;
    }

    return Array.isArray(pool) ? pool : [new Map(Object.entries(pool))];
  }
}

module.exports = LootTable;
