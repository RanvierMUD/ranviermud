'use strict';

/**
 * Classes representing various channel audiences
 *
 * See the {@link http://ranviermud.com/extending/channels/|Channel guide} for usage
 * @namespace ChannelAudience
 */

/**
 * Base channel audience class
 */
class ChannelAudience {
  /**
   * Configure the current state for the audience. Called by {@link Channel#send}
   * @param {object} options
   * @param {GameState} options.state
   * @param {Player} options.sender
   * @param {string} options.message
   */
  configure(options) {
    this.state = options.state;
    this.sender = options.sender;
    this.message = options.message;
  }

  /**
   * Find targets for this audience
   * @return {Array<Player>}
   */
  getBroadcastTargets() {
    return this.state.PlayerManager.getPlayersAsArray();
  }

  /**
   * Modify the message to be sent
   * @param {string} message
   * @return {string}
   */
  alterMessage(message) {
    return message;
  }
}

module.exports = ChannelAudience;
