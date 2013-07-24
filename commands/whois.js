exports.command = function (rooms, items, players, npcs, Commands)
{
	return function (args, player)
	{
		players.eachIf(function(p){
            return p.getName() === args;
        }, function (p) {
			player.say(p.getName() + " - Level " + p.getAttribute("level") + " " + p.getAttribute("class")+"\n"+
                "TestNewLine");
		});
	};
};
