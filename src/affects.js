/** DANG TYPOS, FIXING THIS ONE WILL BREAK IT ALLLLLLLL
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
				config.player.setAttribute('maxHP', config.player.getAttribute('maxHP') + config.magnitude);
				config.player.setAttribute('health', config.player.getAttribute('maxHP'));
			},
			deactivate: function () {
				config.player.setAttribute('maxHP', config.player.getAttribute('maxHP') - config.magnitude);
				config.player.setAttribute('health', config.player.getAttribute('maxHP'));
			}
		};

		if (config.duration) {
			affect.duration = config.duration;
		} else if (config.event) {
			affect.event = config.event;
		}

		return affect;
	},

	/**
	 * Generic speed boost
	 */
	speed_boost: function (config)
	{
		var affect = {
			activate: function () {
				config.player.setAttribute('speed', config.player.getAttribute('speed') + config.magnitude);
			},
			deactivate: function () {
				config.player.setAttribute('speed', config.player.getAttribute('speed') - config.magnitude);
			}
		};

		if (config.duration) {
			affect.duration = config.duration;
		} else if (config.event) {
			affect.event = config.event;
		}

		return affect;
	},

	/**
	 * Generic intelligence boost
	 */
	intelligence_boost: function (config)
	{
		var affect = {
			activate: function () {
				config.player.setAttribute('intelligence', config.player.getAttribute('intelligence') + config.magnitude);
			},
			deactivate: function () {
				config.player.setAttribute('intelligence', config.player.getAttribute('intelligence') - config.magnitude);
			}
		};

		if (config.duration) {
			affect.duration = config.duration;
		} else if (config.event) {
			affect.event = config.event;
		}

		return affect;
	},

		/**
	 * Generic psion boost
	 */
	psion_boost: function (config)
	{
		var affect = {
			activate: function () {
				config.player.setAttribute('maxPsion', config.player.getAttribute('maxPsion') + config.magnitude);
				config.player.setAttribute('psion', config.player.getAttribute('maxPsion'));
			},
			deactivate: function () {
				config.player.setAttribute('maxPsion', config.player.getAttribute('maxPsion') - config.magnitude);
				config.player.setAttribute('psion', config.player.getAttribute('maxPsion'));
			}
		};

		if (config.duration) {
			affect.duration = config.duration;
		} else if (config.event) {
			affect.event = config.event;
		}

		return affect;
	},

};
