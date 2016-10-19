'use strict';
const LevelUtil = require('../../../src/levels').LevelUtil;


exports.listeners = {
  hit: function (l10n) {
    return function (room, attacker, defender, players, hitLocation, damageDealt) {
      checkForCrit(attacker, defender, damageDealt);
    }
  },

  wield: function (l10n) {
    return function (location, room, player, players) {
      if (missedPrerequisites.length) {

				const penalize = (player, attr, callback) => {
					const factor = player.getAttribute(attr) / this.getPrerequisite(attr); //TODO: Extract
					callback(factor);
				}
				const getPenaltyDesc = (item, location, status) => status + '_by_' + item.getShortDesc() + '_' + location;


				//TODO: Adjust or extract this as it is just copied and pasted from the default wear scripto.
        missedPrerequisites.forEach(prereq => {
          switch (prereq) {
            case 'stamina':
							return penalize(player, 'stamina', factor => {
								player.say('You are not strong enough to wear this properly.');
								player.addEffect(getPenaltyDesc(this, location, 'encumbered'), Effects.encumbered({ player, factor }));
								player.combat.addSpeedMod({
									name: 'encumbered_by_' + this.getShortDesc() + '_' + location,
									effect: speed => speed * factor //TODO: Extract
								});
							}); //TODO: Refactor all to do this.
            case 'quickness':
              const factor = player.getAttribute('quickness') / this.getPrerequisite('quickness');

              player.say('You are not quick enough to move about deftly in this.');
              player.combat.addDodgeMod({
                name: 'slowed_by_' + this.getShortDesc() + '_' + location, //TODO: Extract
                effect: dodge => dodge * factor
              });

              break;
            case 'cleverness':
              const factor = player.getAttribute('cleverness') / this.getPrerequisite('cleverness');

              player.say('You are not sure how to handle this piece of gear...');
              player.combat.addToHitMod({
                name: 'confused_by_' + this.getShortDesc() + '_' + location,
                effect: toHit => toHit * factor
              });

              break;
            case 'willpower':
              const factor = player.getAttribute('cleverness') / this.getPrerequisite('cleverness');

              player.say('You find yourself easily distracted as you don the ' + this.getShortDesc());
              player.combat.addDefenseMod({
                name: 'distracted_by_' + this.getShortDesc() + '_' + location,
                effect: defense => defense * factor
              });

              break;
            default:
              player.say('You have some trouble putting that on...');

          }
        });

      }
    }
  },

};

function checkForCrit(attacker, defender, damageDealt) {
  var defenderHealth = defender.getAttribute('health');
  var defenderMaxHealth = defender.getAttribute('max_health');

  var massiveDamage = damageDealt > defenderMaxHealth * .5;
  var almostDead = defenderHealth <= defenderMaxHealth * .2;
  var coupDeGrace = almostDead && damageDealt >= defenderHealth;

  if (massiveDamage || coupDeGrace) {
    attacker.say('<bold><cyan>You have dealt a critical blow!</cyan></bold>');
  }
}
