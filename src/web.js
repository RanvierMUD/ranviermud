var players = null;
var npcs    = null;
var rooms   = null;
var items   = null;

var express = require('express');
exports.Web = {
	init: function (app)
	{
		app.set('views', __dirname + '/../web');
		app.set('view engine', 'jade');
		app.set("view options", { layout: false });
		app.use(express.static(__dirname + '/../web/static/'));

		app.get('/', function (req, res)
		{
			res.render('index.jade', {area: req.params.area || 'test'});
		});

		app.get('/area/:area', function (req, res)
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
		});

		app.get('/room/:room', function (req, res)
		{
			if (!req.params.room) {
				return res.send(JSON.stringify({}));
			}

			return 
		});

		app.listen(8080);
	},
	configure: function (config)
	{
		players = players || config.players;
		items   = items   || config.items;
		rooms   = rooms   || config.rooms;
		npcs    = npcs    || config.npcs;
	}
};
