'use strict';

const QuestGoal = require('../../../src/QuestGoal');

/**
 * A quest goal requiring the player picks up a certain number of a particular item
 */
class FetchGoal extends QuestGoal {
  constructor(quest, config, player) {
    config = Object.assign({
      title: 'Retrieve Item',
      removeItem: false,
      count: 1,
      item: null
    }, config);

    super(quest, config, player);

    this.state = {
      count: 0
    };

    this.on('get', this._getItem);
    this.on('drop', this._dropItem);
    this.on('decay', this._dropItem);
    this.on('start', this._checkInventory);
  }

  getProgress() {
    const amount = Math.min(this.config.count, this.state.count);
    const percent = (amount / this.config.count) * 100;
    const display = `${this.config.title}: [${amount}/${this.config.count}]`;
    return { percent, display };
  }

  complete() {
    if (this.state.count < this.config.count) {
      return;
    }

    const player = this.quest.player;

    // this fetch quest by default removes all the quest items from the player inv
    if (this.config.removeItem) {
      for (let i = 0; i < this.config.count; i++) {
        for (const [, item] of player.inventory) {
          if (item.entityReference === this.config.item) {
            this.quest.GameState.ItemManager.remove(item);
            break;
          }
        }
      }
    }

    super.complete();
  }

  _getItem(item) {
    if (item.entityReference !== this.config.item) {
      return;
    }

    this.state.count = (this.state.count || 0) + 1;

    if (this.state.count > this.config.count) {
      return;
    }

    this.emit('progress', this.getProgress());
  }

  _dropItem(item) {
    if (!this.state.count || item.entityReference !== this.config.item) {
      return;
    }

    this.state.count--;

    if (this.state.count >= this.config.count) {
      return;
    }

    this.emit('progress', this.getProgress());
  }

  _checkInventory() {
    // when the quest is first started check the player's inventory for items they need
    if (!this.player.inventory) {
      return;
    }

    for (const [uuid, item] of this.player.inventory) {
      this._getItem(item);
    }
  }
}

module.exports = FetchGoal;
