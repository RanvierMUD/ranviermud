/**
 * Put affects you want to reuse in this file
 */
exports.Affects = {
	/**
	 * Generic slow
	 */
	slow: function (config)
	{
		var original_speed = config.target.getAttribute('speed');
		return {
			activate: function () {
				config.target.setAttribute('speed', original_speed * config.magnitude);
			},
			deactivate : function () {
				if (config.target && config.target.isInCombat()) {
					config.target.setAttribute('speed', original_speed);
					if (config.deactivate) {
						config.deactivate();
					}
				}
			},
			duration: config.duration
		}
	},
	/**
	 * Generic health boost
	 */
	health_boost: function (config)
	{
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
