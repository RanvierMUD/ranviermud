exports.listeners = {
	playerEnter: function ()
	{
		return function (room, player)
		{
			var rand = Math.floor(Math.random() * 5 + 1);
			if (rand === 3) {
				player.say("The rat's whiskers twitch and its beady eyes glance in your direction.")
			}
		}
	},
	
};
