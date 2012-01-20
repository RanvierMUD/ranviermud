var players = null;
var npcs    = null;
var rooms   = null;
var items   = null;

var express = require('express');
var routing = require('./web/routes');
exports.Web = {
	init: function (app)
	{
		app.set('views', __dirname + '/../web');
		app.set('view engine', 'jade');
		app.set("view options", { layout: false });
		app.use(express.static(__dirname + '/../web/static/'));

		routing.configure(app, {
			players: players,
			npcs: npcs,
			rooms: rooms,
			items: items
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
