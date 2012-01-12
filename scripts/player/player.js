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
	}
};
