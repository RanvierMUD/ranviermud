'use strict';
const util = require('util');

/**
 * Put effects you want to reuse in this file
 */

const defaultDuration = 10 * 1000;

const debuff = (attribute, config) => {
	config.magnitude = -config.magnitude;
	return buff(attribute, config);
};

const buff = (attribute, config) => {
	const original = config.target.getAttribute(attribute);
	return {
		duration: config.duration || defaultDuration,
		activate: () => config.target.setAttribute(attribute, original + config.magnitude);
		deactivate: () => {
			if (config.target) {
				config.target.setAttribute(attribute, original);
				if (config.deactivate) { config.deactivate(); }
			}
		}
	};
};

const buffWithMax = (attribute, config) => {
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
		},
		duration: config.duration || defaultDuration,
		event: config.event
	};
};

const multiply = (attribute, config) => {
	const original = config.target.getAttribute(attribute);
	return {
		duration: config.duration || defaultDuration,
		activate: () => config.target.setAttribute(attribute, original * config.magnitude);
		deactivate: () => {
			if (config.target) {
				config.target.setAttribute(attribute, original);
				if (config.deactivate) { config.deactivate(); }
			}
		}
	};
};

exports.Effects = {
    /**
     * Generic slow
     */
  slow: config => multiply('speed', config),
  /**
   * Generic health boost
   //TODO: Make into "generic attribute boosting effect"
   * config.player: player whose health is boosted
   * config.magnitude: amt to boost health by
   * config.duration: (opt)amount of time to boost health
   * config.event: (opt)event to trigger health boost
   */
  health_boost: function (config) {
    var affect = {
      activate: function () {
        config.player.setAttribute('max_health', config.player.getAttribute('max_health') + config.magnitude);
        config.player.setAttribute('health', config.player.getAttribute('max_health'));
      },
      deactivate: function () {
        config.player.setAttribute('max_health', config.player.getAttribute('max_health') - config.magnitude);
        config.player.setAttribute('health', config.player.getAttribute('max_health'));
      }
    };

    if (config.duration) {
      affect.duration = config.duration;
    } else if (config.event) {
      affect.event = config.event;
    }

    return affect;
  }
};
