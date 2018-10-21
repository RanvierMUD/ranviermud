'use strict';

const { QuestGoal } = require('ranvier');

/**
 * A quest goal requiring the player kill a certain target a certain number of times
 */
module.exports = class KillGoal extends QuestGoal {
  constructor(quest, config, player) {
    config = Object.assign({
      title: 'Kill Enemy',
      npc: null,
      count: 1
    }, config);

    super(quest, config, player);

    this.state = {
      count: 0
    };

    this.on('deathblow', this._targetKilled);
  }

  getProgress() {
    const percent = (this.state.count / this.config.count) * 100;
    const display = `${this.config.title}: [${this.state.count}/${this.config.count}]`;
    return { percent, display };
  }

  _targetKilled(target) {
    if (target.entityReference !== this.config.npc || this.state.count > this.config.count) {
      return;
    }

    this.state.count++;
    this.emit('progress', this.getProgress());
  }
};
