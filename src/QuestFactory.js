'use strict';

const B = require('./Broadcast');
const Quest = require('./Quest');

/**
 * @property {Map} quests
 */
class QuestFactory {
  constructor() {
    this.quests = new Map();
  }

  add(areaName, id, config, goals) {
    this.quests.set(this._makeQuestKey(areaName, id), { config, goals });
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
   * @param {Player}    player
   * @param {Array}     state     current quest state
   * @return {Quest}
   */
  create(GameState, qid, player, state = []) {
    const quest = this.quests.get(qid);
    const instance = new Quest(GameState, qid, quest.config, player);
    instance.state = state;
    quest.goals.forEach(goal => {
      instance.addGoal(new goal.type(instance, goal.config, player));
    });

    instance.on('progress', (progress) => {
      player.emit('questProgress', instance, progress);
      player.save();
    });

    instance.on('start', () => {
      player.emit('questStart', instance);
      instance.emit('progress', instance.getProgress());
    });

    instance.on('turn-in-ready', () => {
      player.emit('questTurnInReady', instance);
    });

    instance.on('complete', () => {
      player.emit('questComplete', instance);
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
