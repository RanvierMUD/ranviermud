'use strict';

const util      = require('util');
const ItemUtil  = require('../../../src/item_util').ItemUtil;
const Broadcast = require('../../../src/broadcast').Broadcast;

exports.listeners = {
  hit: function () {
    return function (room, attacker, defender, players, hitLocation, damageDealt) {
      ItemUtil.checkForCrit(attacker, defender, damageDealt);
    }
  },

  wield: function () {
    return function (location, room, player, players) {
      const toRoom = Broadcast.toRoom(room, player, null, players);
      const desc = this.getShortDesc();
      const name = player.getName();
      toRoom({
        firstPartyMessage: 'You wield the ' + desc + '.',
        thirdPartyMessage: name + ' wields the ' + desc + '.'
      });
    }
  },

  remove: function () {
    return function (location, room, player, players) {
      const toRoom = Broadcast.toRoom(room, player, null, players);
      const desc = this.getShortDesc('en');
      const name = player.getName();
      toRoom({
        firstPartyMessage: 'You remove the ' + desc + '.',
        thirdPartyMessage: name + ' removes the ' + desc + '.'
      });
    };
  }
};
