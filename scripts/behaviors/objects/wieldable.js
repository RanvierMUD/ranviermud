'use strict';
const LevelUtil = require('../../../src/levels').LevelUtil;
const ItemUtil  = require('../../../src/item_util').ItemUtil;

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
				ItemUtil.useDefaultPenalties(this, player, location, missedPrerequisites);
      }

			const toRoom = Broadcast.toRoom(room, player, null, players);
			const desc = this.getShortDesc('en');
			const name = player.getName();
			Broadcast.consistentMessage(toRoom, {
				firstPartyMessage: 'You wield the ' + desc + '.',
				thirdPartyMessage: name + ' wields the ' + desc + '.'
			});
    }
  },

};
