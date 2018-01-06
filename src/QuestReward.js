'use strict';

/**
 * Representation of a quest reward
 * The {@link http://ranviermud.com/extending/areas/quests/|Quest guide} has instructions on to
 * create new reward type for quests
 */
class QuestReward {
  /**
   * Assign the reward to the player
   * @param {GameState} GameState
   * @param {Quest} quest   quest this reward is being given from
   * @param {object} config
   * @param {Player} player
   */
  static reward(GameState, quest, config, player) {
    throw new Error('Quest reward not implemented');
  }

  /**
   * Render the reward
   * @return string
   */
  static display(GameState, quest, config, player) {
    throw new Error('Quest reward display not implemented');
  }
}

module.exports = QuestReward;

