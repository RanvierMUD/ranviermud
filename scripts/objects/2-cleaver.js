const Random = require('../../src/random').Random;
const Broadcast = require('../../src/broadcast').Broadcast;
const ItemUtil  = require('../../src/item_util').ItemUtil;

const util = require('util');

exports.listeners = {

  wield: function (l10n) {
    return function (location, room, player, players) {
      const toRoom = Broadcast.toRoom(room, player, null, players);

      const firstPartyMessage = '<red>You ready the weighty cleaver.</red>';
      const thirdPartyMessage = '<red>' + player.getShortDesc('en') + ' readies a serious cleaver.</red>'
      toRoom({ firstPartyMessage, thirdPartyMessage });

      const missedPrerequisites = this.checkPrerequisites(player);

      if (!missedPrerequisites.length) {
        player.warn('Some butchery is in order...');
        const butcheryBonus = Math.max(player.getAttribute('cleverness'), player.getAttribute('stamina'));
        player.combat.addToHitMod({
          name: 'cleaver ' + this.getUuid(),
          effect: toHit => toHit + butcheryBonus
        });
        player.combat.addDodgeMod({
          name: 'cleaver ' + this.getUuid(),
          effect: dodge => dodge - 1
        });
      }

    }
  },

  remove: function (l10n) {
    return function (location, room, player, players) {
      const toRoom = Broadcast.toRoom(room, player, null, players);
      const firstPartyMessage = [
        '<yellow>The time for butchery is over...</yellow>'
      ];
      const thirdPartyMessage = [
        player.getShortDesc('en') + ' removes their butcher\'s cleaver.'
      ];
      Broadcast.consistentMessage(toRoom, { firstPartyMessage, thirdPartyMessage });

      ItemUtil.removeDefaultPenaltes(player, this, location);
      player.combat.deleteAllMods('cleaver' + this.getUuid());
    }
  },

  hit: function (l10n) {
		return function (room, attacker, defender, players, hitLocation, damage) {
      const toRoom = Broadcast.toRoom(room, attacker, null, players);

      const firstPartyMessage = [
        'The blade of your cleaver <red>does its job.</red>',
        'The heft of your blade <red>cleaves</red> bone and sinew from ' + defender.getShortDesc('en') + '.',
        'You rend meat from ' + defender.getShortDesc('en') + '\'s bone with the weighty blade.'
      ];
      const thirdPartyMessage = [
        'The blade of ' + attacker.getShortDesc('en') + '\'s cleaver <red>is buried in ' + defender.getShortDesc('en') + ' .</red>',
        'The heft of ' + attacker.getShortDesc('en') + '\'s blade <red>cleaves</red> bone and sinew from ' + defender.getShortDesc('en') + '.',
        'You rend meat from ' + defender.getShortDesc('en') + '\'s bone with the weighty blade.'
      ];

      Broadcast.consistentMessage(toRoom, { firstPartyMessage, thirdPartyMessage });

      // BLOODLUSTTTTTT
      attacker.combat.addDamageMod({
        name: 'cleaver' + this.getUuid(),
        effect: damage => damage + .5
      });
		}
	},

  parry: function(l10n) {
    return function (room, player, attacker, players) {
      const toRoom = Broadcast.toRoom(room, player, null, players);

      const firstPartyMessage = ['<bold><white>The blade of your cleaver halts ' + attacker.getShortDesc('en') + '\'s attack.</white></bold>'];
      const thirdPartyMessage = ['<bold><white>The blade of ' + player.getShortDesc('en') + '\'s cleaver halts ' + attacker.getShortDesc('en') + '\'s attack.</white></bold>'];

      Broadcast.consistentMessage(toRoom, { firstPartyMessage, thirdPartyMessage });

      player.combat.addDamageMod({
        name: 'cleaver' + this.getUuid(),
        effect: damage => damage - .5
      });
    }
  },


};
