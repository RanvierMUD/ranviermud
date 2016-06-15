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
		duration: config.duration || defaultDuration,
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
		duration: config.duration || defaultDuration,
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

		let regenHandle = null;

		return {
			activate: bonus => {
	      bonus = bonus || config.bonus || 1;
	      const self = config.player;
	      const regenInterval = config.interval || 2000;

				if (stat !== 'energy') {
					const config = {
						player: self,
					  interval: 1000,
						stat: 'energy'
					}
					self.addEffect('recuperating', regen(config));
				}

	      regenHandle = setInterval(() => {
	        const current = self.getAttribute(stat);

	        let regenerated = Math.floor(Math.random() * self.getAttribute(attr) + bonus);
	        regenerated = Math.min(self.getAttribute(max), current + regenerated);

	        util.log(self.getName() + ' has regenerated up to ' + regenerated + ' ' + stat + '.');
	        self.setAttribute(stat, regenerated);

	        if (regenerated === self.getAttribute(max)) {
	          clearInterval(regenHandle);
	        }
	      }, regenInterval);
    	},

			deactivate: () => {
				const verb = stat === 'health' ? 'resting' : 'meditating';
				clearInterval(regenHandle);
				if (stat === 'energy') { return; }
				player.say("<blue>You stop " + verb + '.</blue>');
			},
		};
	},

};

exports.Effects = Effects;
