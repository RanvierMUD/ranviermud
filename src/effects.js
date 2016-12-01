'use strict';
const util = require('util');

//TODO: Extract into own directory. Too many effects.
//TODO: Make an atom snippet for this?
//TODO: Effects_utils?
//TODO: These do not persist. Fix?

/**
 * Reusable helper functions and defaults for effects.
 * Pass in the attribute/whatever else changes, along with the config.
 */

const defaultDuration = 10 * 1000;

const getTargetName = config => config.player ?
	config.player.getName() : config.target.getShortDesc('en');

const debuff = (attribute, config) => {
	config.magnitude = -config.magnitude;
	return buff(attribute, config);
};

const buff = (attribute, config) => {
	util.log('Buffing ' + attribute + ': ', getTargetName(config));
	util.log(config.magnitude);

	const original = config.target.getAttribute(attribute);
	return {
		duration: config.duration,
		activate: () => {
			config.target.setAttribute(attribute, original + config.magnitude);
			if (config.activate) { config.activate(); }
		},
		deactivate: () => {
			if (config.target) {
				config.target.setAttribute(attribute, original);
				if (config.deactivate) { config.deactivate(); }
			}
		}
	};
};



const buffWithMax = (attribute, config) => {
	util.log('Buffing ' + attribute + ': ', getTargetName(config));
	util.log(config.magnitude);

	const max = 'max_' + attribute;
	const original = config.player.getAttribute(attribute);
	const originalMax = config.player.getAttribute(max);

	return {
		activate: () => {
			config.player.setAttribute(max, originalMax + config.magnitude);
			config.player.setAttribute(attribute, original + config.magnitude);
		},
		deactivate: () => {
			config.player.setAttribute(max, originalMax);
			config.player.setAttribute(attribute, Math.min(originalMax, config.player.getAttribute(attribute)));
			if (config.deactivate) { config.deactivate(); }
		},
		duration: config.duration,
		event: config.event
	};
};

const multiply = (attribute, config) => {
	util.log('Multiplying ' + attribute + ': ', getTargetName(config));
	util.log(config.magnitude);

	const original = config.target.getAttribute(attribute);
	return {
		duration: config.duration || defaultDuration,
		activate: () => {
			config.target.setAttribute(attribute, original * config.magnitude);
			if (config.activate) { config.activate(); }
		},
		deactivate: () => {
			if (config.target) {
				config.target.setAttribute(attribute, original);
				if (config.deactivate) { config.deactivate(); }
			}
		}
	};
};

const Effects = {

	knockdown: config => ({
		duration: config.duration || 8000,
		activate: () => {
			const target = config.target;
			const magnitude = config.magnitude || 10;

			target.addDodgeMod({
				name: 'knocked down',
				effect: dodge => Math.max(1, dodge - magnitude)
			});
			target.addToHitMod({
				name: 'knocked down',
				effect: toHit => Math.max(1, toHit - magnitude)
			});
		},
		deactivate: () => {
			const target = config.target;

			target.deleteAllMods('knocked down')
		}
	}),

	// A function returning an effects object.
	// Used when a player equips an item they don't have enough stamina for.
	// Lowers energy and max energy.
	encumbered: ({ player, factor }) => {
		return {
			activate: () => {
				const energy    = player.getAttribute('energy');
				const maxEnergy = player.getAttribute('max_energy');
				const penalizedEnergy = maxEnergy * factor
				player.setAttribute('max_energy', penalizedEnergy);
				player.setAttribute('energy', Math.min(energy, penalizedEnergy));
			},
			
			deactivate: () => {
				const maxEnergy = player.getAttribute('max_energy');
				player.setAttribute('max_energy', maxEnergy / factor);
			}
		}
	},

	// A function returning an effects object.
	// Used when a player equips an item they don't have enough willpower for.
	// Lowers sanity and max sanity.
	distracted: config => ({
		activate: () => {
			const player = config.player;
			const factor = config.factor;
			const sanity = player.getAttribute('sanity');
			const maxSanity = player.getAttribute('maxSanity');

			player.setAttribute('maxSanity', Math.round(maxSanity * factor));
			player.setAttribute('sanity', Math.min(sanity, maxSanity * factor));
		},
		deactivate: () => {
			const player = config.player;
			const factor = config.factor;
			const sanity = player.getAttribute('sanity');
			const maxSanity = player.getAttribute('max_sanity');

			player.setAttribute('max_sanity', Math.round(maxSanity / factor));
			player.setAttribute('sanity', Math.min(sanity, maxSanity / factor));
		}
	}),

	// If player runs out of energy during combat...
	fatigued: {
		duration: 5000,
		activate: config => {
			const attacker = config.attacker;
			const fatigue = { name: 'fatigue' };
			if (!attacker.getEffects('fatigued')) {
				attacker.combat.addSpeedMod({
					name:  'fatigued',
					effect: speed => speed * 2,
				});
				attacker.combat.addDamageMod({
					name:  'fatigued',
					effect: damage => damage * .75,
				});
				attacker.combat.addToHitMod({
					name:  'fatigued',
					effect: toHit => toHit * .75,
				});
				attacker.combat.addDodgeMod({
					name:  'fatigued',
					effect: dodge => dodge * .5
				});
			}
		},
		deactivate: config => config.attacker.combat.deleteAllMods('fatigued'),
	},

	// If player is stressed during combat...
	stressed: {
		duration: 5000,
		activate: config => {
			const attacker = config.attacker;
			if (!attacker.getEffects('stressed')) {
				attacker.combat.addSpeedMod({
					name:  'stressed',
					effect: speed => speed / 1.5,
				});
				attacker.combat.addToHitMod({
					name:  'stressed',
					effect: toHit => toHit * .75,
				});
				attacker.combat.addDodgeMod({
					name:  'stressed',
					effect: dodge => dodge * .75
				});
			}
		},
		deactivate: config => config.attacker.combat.deleteAllMods('stressed'),
	},

	// If player is insane during combat...
	insane: {
		duration: 5000,
		activate: config => {
			const attacker = config.attacker;
			if (!attacker.getEffects('insane')) {
				attacker.combat.addSpeedMod({
					name:  'insane',
					effect: speed => speed / 1.5,
				});
				attacker.combat.addToHitMod({
					name:  'insane',
					effect: toHit => toHit * .5,
				});
				attacker.combat.addDamageMod({
					name:  'insane',
					effect: damage => damage * 1.75,
				});
				attacker.combat.addDodgeMod({
					name:  'insane',
					effect: dodge => dodge * .75
				});
			}
		},
		deactivate: config => config.attacker.combat.deleteAllMods('insane'),
	},

  /**
   * Slow
	 * config.target: NPC to slow
	 * config.magnitude: amount to slow by (.5 would be half)
	 * [config.duration]: time in ms to slow for
	 * [config.deactivate]: function to execute after duration is over
   */
  slow: config => multiply('speed', config),

	/**
	 * Haste
	 * config.player: Player doing the targeting (or hasting themselves)
	 * config.targer: Player targeted
	 * config.magnitude
	 * [config.duration]: time in ms to haste for
	 * [config.deactivate]: function to execute after haste
	 */
	haste: config => {
		if (!config.target) { config.target = config.player; }
		return multiply('quickness', config);
	},

  /**
   * Health boost
	 * config.player: player whose health is boosted
   * config.magnitude: amount to boost health by
   * [config.duration]: amount of time to boost health
   * [config.event]: event to trigger health boost
   */
  health_boost: config => buffWithMax('health', config),

	defenseBoost: config => {
		return {
			activate: () => {
				config.player.combat.addDefenseMod({
					name: config.name,
					effect: defense => defense * config.magnitude
				});
			},
			deactivate: () => {
				config.player.combat.removeDefenseMod(config.name);
			},
			event: config.event
		}
	},

	fortify: config => {
		if (!config.target) { config.target = config.player; }
		return buff('stamina', config);
	},

	regen: config => {
		const stat = config.stat || 'health';
		const max  = 'max_' + stat;
		const attr = stat === 'sanity' ? 'willpower' : 'stamina';
		const isFeat = config.isFeat;
		const player = config.player;

		let regenHandle = null;

		return {
			activate: bonus => {
	      bonus = bonus || config.bonus || 1;

	      const player = config.player;
	      const interval = config.interval || 2000;

				if (stat !== 'energy') {
					const bonus = player.getSkills('athletics') + 5;
					const energyConfig = {
						player,
					  interval,
						stat: 'energy',
						bonus,
					};
					player.addEffect('recuperating', Effects.regen(energyConfig));
				}

	      regenHandle = setInterval(() => {
	        const current = player.getAttribute(stat);
					const modifier = player.getAttribute(attr);

	        let regenerated = Math.round(Math.random() * modifier) + bonus;
					regenerated = Math.min(player.getAttribute(max), current + regenerated);

					util.log(player.getName() + ' has regenerated up to ' + regenerated + ' ' + stat + '.');
	        player.setAttribute(stat, regenerated);

	        if (regenerated === player.getAttribute(max)) {
						util.log(player.getName() + ' has reached ' + max);
	          clearInterval(regenHandle);
	        }
	      }, interval);
    	},

			deactivate: () => {
				const isHealth = stat === 'health';
				const verb = getRegenVerb(isHealth, isFeat);

				clearInterval(regenHandle);

				if (config.callback) { config.callback(); }
				if (stat === 'energy') { return; }
				player.say("<blue>You stop " + verb + '.</blue>');
			},
		};
	},

};

function getRegenVerb(isHealth, isFeat) {
	if (isHealth && isFeat) { return 'regenerating'; }
	if (isHealth) { return 'resting'; }
	return 'meditating';
}

const getSpecialEncumbranceEffects = entity => ({
    
	'insubstantial': {
		'dodgeMods': {
			name: 'encumbrance',
			effect: dodge => dodge + Math.ceil(entity.getAttribute('quickness') / 2)
		},
		'defenseMods': {
			name:  'encumbrance',
			effect: defense => defense - 2
		},
		'damageMods': {
			name:  'encumbrance',
			effect: damage => damage - 2 
		},
		'toHitMods': {
			name: 'encumbrance',
			effect: toHit => toHit + Math.ceil(entity.getAttribute('level') / 4)
		}
	},

	'light': {
		'defenseMods': {
			name:  'encumbrance',
			effect: defense => defense - 1
		},
		'damageMods': {
			name:  'encumbrance',
			effect: damage => damage - 1 
		},
		'toHitMods': {
			name: 'encumbrance',
			effect: toHit => toHit + Math.ceil(entity.getAttribute('level') / 5)
		}
	},

	'burdensome': {
		'dodgeMods': {
			name:  'encumbrance',
			effect: dodge => Math.ceil(dodge / 2) 
		}
	},

	'overburdening': {
		'toHitMods': {
			name: 'encumbrance',
			effect: toHit => Math.ceil(toHit / 2)
		},
		'dodgeMods': {
			name: 'encumbrance',
			effect: dodge => Math.floor(dodge / 4)
		}
	},

	'crushing': {
		'toHitMods': {
			name: 'encumbrance',
			effect: toHit => Math.floor(toHit / 3)
		},
		'dodgeMods': {
			name: 'encumbrance',
			effect: dodge => 0
		}
	},

	'back-breaking': {
		'toHitMods': {
			name: 'encumbrance',
			effect: toHit => Math.floor(toHit / 2)
		},
		'dodgeMods': {
			name: 'encumbrance',
			effect: dodge => Math.floor(dodge / 5)
		}
	},

});

exports.Effects = Effects;
exports.getSpecialEncumbranceEffects = getSpecialEncumbranceEffects;
