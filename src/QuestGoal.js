'use strict';

const EventEmitter = require('events');

/**
 * Representation of a goal of a quest.
 * The {@link http://ranviermud.com/extending/areas/quests/|Quest guide} has instructions on to
 * create new quest goals for quests
 * @extends EventEmitter
 */
class QuestGoal extends EventEmitter {
  /**
   * @param {Quest} quest Quest this goal is for
   * @param {object} config
   * @param {Player} player
   */
  constructor(quest, config, player) {
    super();

    this.config = Object.assign({
      // no defaults currently
    }, config);
    this.quest = quest;
    this.state = {};
    this.player = player;
  }

  /**
   * @return {{ percent: number, display: string}}
   */
  getProgress() {
    return {
      percent: 0,
      display: '[WARNING] Quest does not have progress display configured. Please tell an admin'
    };
  }

  /**
   * Put any cleanup activities after the quest is finished here
   */
  complete() {
  }

  serialize() {
    return {
      state: this.state,
      progress: this.getProgress(),
    };
  }

  hydrate(state) {
    this.state = state;
  }
}

module.exports = QuestGoal;
