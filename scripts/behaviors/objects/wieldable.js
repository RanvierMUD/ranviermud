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

  remove: function (l10n) {
    return function (location, room, player, players) {
      console.log(players);
      const toRoom = Broadcast.toRoom(room, player, null, players);
      const desc = this.getShortDesc('en');
      const name = player.getName();
      toRoom({
        firstPartyMessage: 'You remove the ' + desc + '.',
        thirdPartyMessage: name + ' removes the ' + desc + '.'
      });

      // Remove penalties that may have been added.
      player.removeEffect('encumbered_by_' + this.getShortDesc() + location);
      player.removeEffect('confused_by_' + this.getShortDesc() + location);

      player.combat.deleteAllMods('distracted_by_' + this.getShortDesc() + '_' + location);
      player.combat.deleteAllMods('encumbered_by_' + this.getShortDesc() + '_' + location);
      player.combat.deleteAllMods('slowed_by_' + this.getShortDesc() + '_' + location);
    };
  }

};
