'use strict';

const Broadcast = require('../../../src/broadcast').Broadcast;
const ItemUtil  = require('../../../src/item_util').ItemUtil;

exports.listeners = {

  wear: function () {
    return function (location, room, player, players) {
      const toRoom = Broadcast.toRoom(room, player, null, players);
      const desc = this.getShortDesc();
      const name = player.getName();
      toRoom({
        firstPartyMessage: `You wear the ${desc}.`,
        thirdPartyMessage: `${name} wears the ${desc}.`
      });
    };
  },

  remove: function () {
    return function (location, room, player, players) {
      const toRoom = Broadcast.toRoom(room, player, null, players);
      const desc = this.getShortDesc();
      const name = player.getName();
      toRoom({
        firstPartyMessage: `You remove the ${desc}.`,
        thirdPartyMessage: `${name} removes the ${desc}.`
      });
    };
  }
};
