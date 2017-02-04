'use strict';

const EventEmitter = require('events');

/**
 * @property {object} config Default config for this quest, see individual quest types for details
 * @property {Player} player
 * @property {object} state  Current completion state
 */
class Quest extends EventEmitter {
  constructor(qid, config, player) {
    super();

    this.id = qid;
    this.config = Object.assign({
      title: 'Missing Quest Title',
      desc: 'Missing Quest Description',
      requires: [],
      repeatable: false
    }, config);

    this.player = player;
    this.state = {};
  }

  /**
   * @return {{ percent: number, display: string }}
   */
  getProgress() {
    return {
      percent: 0,
      display: 'Base Quest',
    };
  }

  serialize() {
    return {
      state: this.state
    }
  }

  complete() {
    this.emit('complete');
  }
}

module.exports = Quest;
