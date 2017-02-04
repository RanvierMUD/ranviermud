'use strict';

const Quest = require('../../../src/Quest');

/**
 * An auto-completing fetch quest (quest where you have to fetch a number of a specific item)
 */
class FetchQuest extends Quest {
  constructor(qid, config, player) {
    config = Object.assign({
      removeItem: false,
      reward: 0
    }, config);

    super(qid, config, player);

    this.state = {
      count: 0
    };

    this.on('get', this._getItem);
    this.on('drop', this._dropItem);
  }

  getProgress() {
    const percent = this.state.count / this.config.targetCount;
    const display = `${this.config.title}: [${this.state.count}/${this.config.targetCount}]`;
    return { percent, display };
  }

  _getItem(item) {
    if (item.globalId !== this.config.targetItem) {
      return;
    }

    this.state.count = (this.state.count || 0) + 1;

    this.emit('progress', this.getProgress());

    if (this.state.count >= this.config.targetCount) {
      this.emit('complete');

      // this fetch quest by default removes all the quest items from the player inv
      if (this.config.removeItem) {
        for (let i = 0; i < this.config.targetCount; i++) {
          for (const [uuid, item] of this.player.inventory) {
            if (item.globalId === this.config.targetItem) {
              this.player.removeItem(item);
            }
          }
        }
      }

      this.player.emit('experience', this.config.reward(this, this.player));
    }
  }

  _dropItem(item) {
    if (item.globalId !== this.config.targetItem) {
      return;
    }

    this.state.count--;
    this.emit('progress', this.getProgress());
  }
}

module.exports = FetchQuest;
