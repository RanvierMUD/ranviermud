'use strict';

/**
 * Keeps track of player quest progress
 *
 * @property {Player} player
 * @property {Map}    completedQuests
 * @property {Map}    activeQuests
 */
class QuestTracker {
  /**
   * @param {Player} player
   * @param {Array}  active
   * @param {Array}  completed
   */
  constructor(player, active, completed) {
    this.player = player;

    this.activeQuests = new Map(active);
    this.completedQuests = new Map(completed);
  }

  /**
   * Proxy events to all active quests
   * @param {string} event
   * @param {...*}   args
   */
  emit(event, ...args) {
    for (const [ qid, quest ] of this.activeQuests) {
      quest.emit(event, ...args);
    }
  }

  /**
   * @param {string} qid
   * @return {boolean}
   */
  isActive(qid) {
    return this.activeQuests.has(qid);
  }

  /**
   * @param {string} qid
   * @return {boolean}
   */
  isComplete(qid) {
    return this.completedQuests.has(qid);
  }

  get(qid) {
    return this.activeQuests.get(qid);
  }

  /**
   * @param {string} qid
   */
  complete(qid) {
    if (!this.isActive(qid)) {
      throw new Error('Quest not started');
    }

    this.completedQuests.set(qid, {
      started: this.activeQuests.get(qid).started,
      completedAt: (new Date()).toJSON()
    });

    this.activeQuests.delete(qid);
  }

  /**
   * @param {Quest} quest
   * @return {boolean}
   */
  canStart(quest) {
    if (this.completedQuests.has(quest.id) && !quest.config.repeatable) {
      return false;
    }

    return !this.isActive(quest.id) && quest.config.requires.every((qid) => {
      return this.isComplete(qid);
    });
  }

  /**
   * @param {Quest} queset
   */
  start(quest) {
    if (this.activeQuests.has(quest.id)) {
      throw new Error('Quest already started');
    }

    quest.started = (new Date()).toJSON();
    this.activeQuests.set(quest.id, quest);
    quest.emit('start');
  }

  /**
   * @param {GameState} state
   * @param {object}    questData Data pulled from the pfile
   */
  hydrate(state) {
    for (const [qid, data] of this.activeQuests) {
      const quest = state.QuestFactory.create(state, qid, data.state, this.player);
      quest.started = data.started;

      this.activeQuests.set(qid, quest);
    }
  }

  /**
   * @return {object}
   */
  serialize() {
    return {
      completed: [...this.completedQuests],
      active: [...this.activeQuests].map(([qid, quest]) =>  [qid, quest.serialize()]),
    };
  }
}

module.exports = QuestTracker;
