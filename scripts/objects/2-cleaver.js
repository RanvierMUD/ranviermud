const Random = require('../../src/random').Random;
const Broadcast = require('../../src/broadcast').Broadcast;

exports.listeners = {

  wield: function (l10n) {
    return function (location, player, players) {
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
		return function (player) {
      const msg = Random.fromArray([
        'The blade of your cleaver <red>does its job.</red>',
        'The heft of your blade <red>cleaves</red> bone and sinew.',
        'You rend meat from bone with the weighty blade.'
      ]);
			player.say('<bold>' + msg + '</bold>');
      player.combat.addDamageMod({
        name: 'cleaver' + this.getUuid(),
        effect: damage => damage + .5
      });
		}
	},

  parry: function(l10n) {
    return function (player) {
      player.say('<bold><white>The blade of your cleaver halts their attack.</white></bold>');
      player.combat.addDamageMod({
        name: 'cleaver' + this.getUuid(),
        effect: damage => damage - .5
      });
    }
  },


};
