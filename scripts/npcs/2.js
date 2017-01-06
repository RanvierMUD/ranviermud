exports.listeners = {
	playerEnter: function ()
	{
		return function (room, player)
		{
			var rand = Math.floor(Math.random() * 5 + 1);
			if (rand === 3) {
				player.say("The revenant turns and stares at you, its dull eyes skewed in opposite directions.");
			}
		}
	},
	
};