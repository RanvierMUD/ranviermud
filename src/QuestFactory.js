'use strict';

const Quest = require('./Quest');
const Logger = require('./Logger');

/**
 * @property {Map} quests
 */
class QuestFactory {
  constructor() {
    this.quests = new Map();
  }

  add(areaName, id, config) {
    const entityRef = this.makeQuestKey(areaName, id);
    config.entityReference = entityRef;
    this.quests.set(entityRef, { id, area: areaName, config });
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
    if (!quest) {
      throw new Error(`Trying to create invalid quest id [${qid}]`);
    }

    const instance = new Quest(GameState, quest.id, quest.config, player);
    instance.state = state;
    for (const goal of quest.config.goals) {
      const goalType = GameState.QuestGoalManager.get(goal.type);
      instance.addGoal(new goalType(instance, goal.config, player));
    }

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

      for (const reward of quest.config.rewards) {
        try {
          const rewardClass = GameState.QuestRewardManager.get(reward.type);

          if (!rewardClass) {
            throw new Error(`Quest [${qid}] has invalid reward type ${reward.type}`);
          }

          rewardClass.reward(GameState, instance, reward.config, player);
          player.emit('questReward', reward);
        } catch (e) {
          Logger.error(e.message);
        }
      }

      player.save();
    });

    return instance;
  }

  /**
   * @param {string} areaName
   * @param {number} id
   * @return {string}
   */
  makeQuestKey(area, id) {
    return area + ':' + id;
  }
}

module.exports = QuestFactory;
