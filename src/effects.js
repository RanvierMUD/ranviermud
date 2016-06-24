'use strict';
const util = require('util');

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
  health_boost:  config => buffWithMax('health', config),

	fortify: config => {
		if (!config.target) { config.target = config.player; }
		return buff('stamina', config);
	},

	regen: config => {
		const stat = config.stat || 'health';
		const max = 'max_' + stat;
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
					const energyConfig = {
						player,
					  interval,
						stat: 'energy',
						bonus: player.getSkills('athletics'),
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

exports.Effects = Effects;
