var Data = require('../data').Data;
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
	'/room/:room([0-9]+)?': {
		get: function (players, npcs, rooms, items)
		{
			return function (req, res)
			{
				if (!req.params.room) {
					return res.send(JSON.stringify({}));
				}

				return res.send(JSON.stringify(rooms.getAt(req.params.room).stringify()));
			}
		},
		post: function (players, npcs, rooms, items)
		{
			return function (req, res)
			{
				if (!req.body.location) {
					return res.send(JSON.stringify({
						error: "No room given"
					}));
				}

				var data = req.body;
				var filename = rooms.getAt(data.location).filename;
				var index    = rooms.getAt(data.location).file_index;
				Data.writeData(filename, index, data, function (err) {
					if (err) {
						return res.send(JSON.stringify({
							error: "No room given"
						}));
					}

					res.send(data);
				});
			}
		}
	}
};

exports.configure = function (app, config)
{
	for (var route in routes) {
		if (typeof routes[route] === 'function') {
		app.get(route, routes[route](
			config.players, config.npcs, config.rooms, config.items
		));
		} else {
			for (var method in routes[route]) {
				app[method](route, routes[route][method](
					config.players, config.npcs, config.rooms, config.items
				));
			}
		}
	}
};

exports.routes = routes;
