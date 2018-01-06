'use strict';

const LevelUtil = require('../../ranvier-lib/lib/LevelUtil');

module.exports = srcPath => {
  const QuestReward = require(srcPath + 'QuestReward');
  /**
   * Quest reward that gives experience
   *
   * Config options:
   *   currency: string, required, currency to award
   *   amount: number, required
   */
  return class CurrencyReward extends QuestReward {
    static reward(quest, config, player) {
      config = Object.assign({
        amount: 0,
        currency: null,
      }, config);

      if (!config.currency) {
        throw new Error(`Quest [${quest.id}] currency reward has invalid configuration`);
      }

      let amount = config.amount;
      player.emit('currency', config.currency, amount);
    }
  };
};

