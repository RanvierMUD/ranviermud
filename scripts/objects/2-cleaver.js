const Random = require('../../src/random').Random;
const Broadcast = require('../../src/broadcast').Broadcast;

exports.listeners = {

  wield: function (l10n) {
    return function (location, room, player, players) {
      player.say('You ready the weighty cleaver.');
      player.combat.addToHitMod({
        name: 'cleaver ' + this.getUuid(),
        effect: toHit => toHit + 1
      });
      player.combat.addToDodgeMod({
        name: 'cleaver ' + this.getUuid(),
        effect: dodge => dodge - 1
      });
    }
  },

  remove: function (l10n) {
    return function (player) {
      player.say('You place the bulky cleaver in your pack.');
      player.combat.deleteAllMods('cleaver' + this.getUuid());
    }
  },

  hit: function (l10n) {
		return function (room, attacker, defender, players, hitLocation, damage) {
      const toRoom = Broadcast.toRoom(room, attacker, null, players);

      const firstPartyMessage = [
        'The blade of your cleaver <red>does its job.</red>',
        'The heft of your blade <red>cleaves</red> bone and sinew from ' + defender.getShortDesc() + '.',
        'You rend meat from ' + defender.getShortDesc() + '\'s bone with the weighty blade.'
      ];
      const thirdPartyMessage = [
        'The blade of ' + attacker.getShortDesc() + '\'s cleaver <red>is buried in ' + defender.getShortDesc() + ' .</red>',
        'The heft of ' + attacker.getShortDesc() + '\'s blade <red>cleaves</red> bone and sinew from ' + defender.getShortDesc() + '.',
        'You rend meat from ' + defender.getShortDesc() + '\'s bone with the weighty blade.'
      ];

      util.log('======emitting hit thing stuff for cleavuh * * ');

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

      const firstPartyMessage = ['<bold><white>The blade of your cleaver halts ' + attacker.getShortDesc() + '\'s attack.</white></bold>'];
      const thirdPartyMessage = ['<bold><white>The blade of ' + player.getShortDesc() + '\'s cleaver halts ' + attacker.getShortDesc() + '\'s attack.</white></bold>'];

      Broadcast.consistentMessage(toRoom, { firstPartyMessage, thirdPartyMessage });

      player.combat.addDamageMod({
        name: 'cleaver' + this.getUuid(),
        effect: damage => damage - .5
      });
    }
  },


};
