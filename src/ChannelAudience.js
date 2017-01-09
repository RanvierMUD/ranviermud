'use strict';

/**
 * Constants for Channel.audience
 */
module.exports = {
  // Seen by everyone in the world
  WORLD: Symbol("WORLD"),
  // Seen by all players in the senders area
  AREA: Symbol("AREA"),
  // Seen by all players in the room
  ROOM: Symbol("ROOM"),
  // Only seen by sender and target
  PRIVATE: Symbol("PRIVATE"),
};
