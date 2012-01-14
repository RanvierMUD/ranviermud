var LevelUtils = require('../../src/levels').LevelUtils;
exports.listeners = {
	regen: function (l10n)
	{
		return function ()
		{
			var self = this;
			self.prompt();
			var regen = setInterval(function () {
				var health = self.getAttribute('health');
				var regenerated = Math.floor(Math.random() * 19 + 1);

				regenerated = Math.min(self.getAttribute('max_health'), health + regenerated);

				self.setAttribute('health', regenerated);
				if (regenerated === self.getAttribute('max_health')) {
					clearInterval(regen);
				}
			}, 2000);
		}
	},
	experience: function (l10n)
	{
		return function (experience)
		{
			// max level 60
			if (this.getAttribute('level') >= 60) {
				return;
			}

			this.sayL10n(l10n, 'EXPGAIN', experience);

			var tnl = LevelUtils.expToLevel(this.getAttribute('level')) - this.getAttribute('experience');

			if (experience >= tnl ) {
				var newlevel = this.getAttribute('level') + 1;
				var health_gain = Math.ceil(this.getAttribute('max_health') * 1.10);

				this.sayL10n(l10n, 'LEVELUP', newlevel, health_gain - this.getAttribute('max_health'));
				this.setAttribute('level', newlevel);
				this.setAttribute('experience', 0);

				// do whatever you want to do here when a player levels up...
				this.setAttribute('max_health', health_gain);
				this.setAttribute('health', this.getAttribute('max_health'));
				return;
			}

			this.setAttribute('experience', this.getAttribute('experience') + experience);
		}
	},
	die: function (l10n)
	{
		return function ()
		{
			// they died, move then back to the start... you can do whatever you want instead of this
			self.setLocation(1);
			self.emit('regen');

			self.setAttribute('experience', self.getAttribute('experience') - (self.getAttribute('experience') * 0.90));
		}
	},
};
