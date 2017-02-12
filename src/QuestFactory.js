'use strict';

const Broadcast = require('./Broadcast');

/**
 * @property {Map} quests
 */
class QuestFactory {
  constructor() {
    this.quests = new Map();
  }

  add(areaName, id, type, config) {
    this.quests.set(this._makeQuestKey(areaName, id), { type, config });
  }

  set(qid, val) {
    this.quests.set(qid, val);
  }

  /**
   * Get a quest definition. Use `create` if you want an instance of a quest
   * @param {string} qid
   * @return {object}
   */
  get(qid) {
    return this.quests.get(qid);
  }

  /**
   * @param {GameState} GameState
   * @param {string}    qid
   * @param {object}    state     current quest state
   * @param {Player}    player
   * @return {Quest}
   */
  create(GameState, qid, state, player) {
    const quest = this.quests.get(qid);
    const instance = new quest.type(qid, quest.config, player);
    instance.state = Object.assign(instance.state, state);

    // Can't think of a better place to put this stuff yet
    instance.on('start', () => {
      Broadcast.sayAt(player, `\r\n<bold><yellow>Quest Started: ${instance.config.title}!</yellow></bold>`);
      if (instance.config.desc) {
        Broadcast.sayAt(player, (new Array(80)).join('-'));
        Broadcast.sayAt(player, `<bold><yellow>${instance.config.desc}</yellow></bold>`);
      }
    });

    instance.on('progress', (progress) => {
      Broadcast.sayAt(player, `\r\n<bold><yellow>${progress.display}</yellow></bold>`);
      player.save();
    });

    instance.on('turn-in-ready', () => {
      Broadcast.sayAt(player, `\r\n<bold><yellow>${instance.config.title} ready to turn in!</yellow></bold>`);
    });

    instance.on('complete', () => {
      Broadcast.sayAt(player, `\r\n<bold><yellow>Quest Complete: ${instance.config.title}!</yellow></bold>`);
      player.questTracker.complete(instance.id);
      player.save();
    });

    return instance;
  }

  /**
   * @param {string} areaName
   * @param {number} id
   * @return {string}
   */
  _makeQuestKey(area, id) {
    return area + ':' + id;
  }
}

module.exports = QuestFactory;
