var LevelUtil = require('../../src/levels').LevelUtil,
    Skills     = require('../../src/skills').Skills;
exports.listeners = {
	regen: function (l10n)
	{
		return function ()
		{
			var self = this;
			self.prompt();
			var regen = setInterval(function () {
				var health = self.getAttribute('health');
				var regenerated = self.roll(2, self.getAttribute('willpower'), 1, self.getAttribute('strength'));

				regenerated = Math.min(self.getAttribute("maxHP"), health + regenerated);

				self.setAttribute('health', regenerated);
				if (regenerated === self.getAttribute("maxHP")) {
					clearInterval(regen);
				}
			}, 10000);
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

			var tnl = LevelUtil.expToLevel(this.getAttribute('level')) - this.getAttribute('experience');

			if (experience >= tnl ) {
				return this.emit('level');
			}

			this.setAttribute('experience', this.getAttribute('experience') + experience);
		}
	},
	level: function (l10n)
	{
		return function ()
		{
			var newlevel = this.getAttribute('level') + 1;
			var health_gain = Math.ceil(this.getAttribute('maxHP') * 1.05 + (this.getAttribute('willpower') + this.getAttribute('strength'))/2);

			this.sayL10n(l10n, 'LEVELUP', newlevel, health_gain - this.getAttribute("maxHP"));
			this.setAttribute('level', newlevel);
			this.setAttribute('experience', 0);

			// do whatever you want to do here when a player levels up...
			this.setAttribute("maxHP", health_gain);
			this.setAttribute('health', this.getAttribute("maxHP"));

			// Assign any new skills
			var skills = Skills[this.getAttribute('class')];
			for (var sk in skills) {
				var skill = skills[sk];
				if (skill.level === this.getAttribute('level')) {
					this.addSkill(sk, {
						type: skill.type
					});
					this.sayL10n(l10n, 'NEWSKILL', skill.name);

					if (skill.type === 'passive') {
						this.useSkill(sk, this);
					}
				}
			}
		}
	},
	die: function (l10n)
	{
		return function ()
		{
			// they died, move then back to the start... you can do whatever you want instead of this
			this.setLocation(1);
			this.emit('regen');

			this.setAttribute('experience', this.getAttribute('experience') - Math.ceil((this.getAttribute('experience') * 0.10)));
		}
	},
};
