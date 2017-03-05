'use strict';

const EventEmitter = require('events');

class QuestGoal extends EventEmitter {
  constructor(quest, config, player) {
    super();

    this.config = Object.assign({
      // no defaults currently
    }, config);
    this.quest = quest;
    this.state = {};
  }

  getProgress() {
    return {
      percent: 0,
      display: '[WARNING] Quest does not have progress display configured. Please tell an admin'
    };
  }

  complete() {
  }

  serialize() {
    return { state: this.state };
  }

  hydrate(state) {
    this.state = state;
  }
}

module.exports = QuestGoal;
