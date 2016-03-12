/**
 * Put affects you want to reuse in this file
 */
exports.Affects = {
	/**
	 * Generic slow
	 //TODO: Make into "generic attribute lowering effect"
	 * config.target: thing being slowed
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
	 //TODO: Make into "generic attribute boosting effect"
	 * config.player: player whose health is boosted
	 * config.magnituse: amt to boost health by
	 * config.duration: (opt)amount of time to boost health
	 * config.event: (opt)event to trigger health boost
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
