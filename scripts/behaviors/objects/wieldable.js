'use strict';

const util      = require('util');
const LevelUtil = require('../../../src/levels').LevelUtil;
const ItemUtil  = require('../../../src/item_util').ItemUtil;
const Broadcast = require('../../../src/broadcast').Broadcast;

exports.listeners = {
  hit: function (l10n) {
    return function (room, attacker, defender, players, hitLocation, damageDealt) {
      ItemUtil.checkForCrit(attacker, defender, damageDealt);
    }
  },

  wield: function (l10n) {
    return function (location, room, player, players) {
			const missedPrerequisites = this.checkPrerequisites(player);

      if (missedPrerequisites.length) {
				ItemUtil.useDefaultPenalties(this, player, location, missedPrerequisites, 'wield');
      }

			const toRoom = Broadcast.toRoom(room, player, null, players);
			const desc = this.getShortDesc('en');
			const name = player.getName();
			toRoom({
				firstPartyMessage: 'You wield the ' + desc + '.',
				thirdPartyMessage: name + ' wields the ' + desc + '.'
			});
    }
  },

  // hold: function (l10n) {
  //   return function (location, room, player, players) {
  //     this.emit('wield', location, room, player, players);
  //   }
  // },

  remove: function (l10n) {
    return function (location, room, player, players) {
      const toRoom = Broadcast.toRoom(room, player, null, players);
      const desc = this.getShortDesc('en');
      const name = player.getName();
      toRoom({
        firstPartyMessage: 'You remove the ' + desc + '.',
        thirdPartyMessage: name + ' removes the ' + desc + '.'
      });

      ItemUtil.removeDefaultPenaltes(player, this, location);
    };
  }

};
