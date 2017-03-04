'use strict';

const Quest = require('../../../src/Quest');

/**
 * An auto-completing fetch quest (quest where you have to fetch a number of a specific item)
 */
class FetchQuest extends Quest {
  constructor(qid, config, player) {
    config = Object.assign({
      autoComplete: false,
      removeItem: false,
      reward: _ => 0, // dummy function to reward 0 experience by default
      targetCount: 1
    }, config);

    super(qid, config, player);

    this.state = {
      count: 0
    };

    this.on('get', this._getItem);
    this.on('drop', this._dropItem);
    this.on('decay', this._dropItem);
  }

  getProgress() {
    const percent = (this.state.count / this.config.targetCount) * 100;
    const display = `${this.config.title}: [${this.state.count}/${this.config.targetCount}]`;
    return { percent, display };
  }

  _getItem(item) {
    if (item.entityReference !== this.config.targetItem) {
      return;
    }

    this.state.count = (this.state.count || 0) + 1;

    if (this.state.count > this.config.targetCount) {
      return;
    }

    this.emit('progress', this.getProgress());

    if (this.state.count >= this.config.targetCount) {
      if (this.config.autoComplete) {
        this.complete();
      } else {
        this.emit('turn-in-ready');
      }
    }
  }

  complete() {
    if (this.state.count < this.config.targetCount) {
      return;
    }

    // this fetch quest by default removes all the quest items from the player inv
    if (this.config.removeItem) {
      for (let i = 0; i < this.config.targetCount; i++) {
        for (const [, item] of this.player.inventory) {
          if (item.entityReference === this.config.targetItem) {
            this.player.removeItem(item);
          }
        }
      }
    }

    super.complete();
    this.player.emit('experience', this.config.reward(this, this.player));
  }

  _dropItem(item) {
    if (!this.state.count || item.entityReference !== this.config.targetItem) {
      return;
    }

    this.state.count--;

    if (this.state.count >= this.config.targetCount) {
      return;
    }

    this.emit('progress', this.getProgress());
  }
}

module.exports = FetchQuest;
