var routes = {
	'/': function (players, npcs, rooms, items)
	{
		return function (req, res)
		{
			res.render('index.jade', {area: req.params.area || 'test'});
		}
	},
	'/area/:area': function (players, npcs, rooms, items)
	{
		return function (req, res)
		{
			if (!req.params.area) {
				return res.send(JSON.stringify({rooms:[]}));
			}

			var area = rooms.getArea(req.params.area);

			var roomvals = [];
			for (var i in rooms.rooms) { roomvals.push(rooms.rooms[i].flatten()); }
			roomvals = roomvals.filter(function (r) { return r.area === req.params.area; });

			res.send(JSON.stringify({
				area: {
					title: area.title,
					rooms: roomvals
				}
			}));
		}
	},
	'/room/:room': function (players, npcs, rooms, items)
	{
		return function (req, res)
		{
			if (!req.params.room) {
				return res.send(JSON.stringify({}));
			}

			return;
		}
	}
};

exports.configure = function (app, config)
{
	for (var route in routes) {
		app.get(route, routes[route](
			config.players, config.npcs, config.rooms, config.items
		));
	}
};

exports.routes = routes;
