'use strict';

const { QuestReward } = require('ranvier');
const LevelUtil = require('../../ranvier-lib/lib/LevelUtil');

/**
 * Quest reward that gives experience
 *
 * Config options:
 *   currency: string, required, currency to award
 *   amount: number, required
 */
module.exports = class CurrencyReward extends QuestReward {
  static reward(GameState, quest, config, player) {
    const amount = this._getAmount(quest, config);
    player.emit('currency', config.currency, amount);
  }

  static display(GameState, quest, config, player) {
    const amount = this._getAmount(quest, config);
    const friendlyName = config.currency.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

    return `Currency: <b>${amount}</b> x <b><white>[${friendlyName}]</white></b>`
  }

  static _getAmount(quest, config) {
    config = Object.assign({
      amount: 0,
      currency: null,
    }, config);

    if (!config.currency) {
      throw new Error(`Quest [${quest.id}] currency reward has invalid configuration`);
    }

    return config.amount;
  }
};

