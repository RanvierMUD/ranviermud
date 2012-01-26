var fs     = require('fs'),
    util   = require('util');
var plugins_dir = __dirname + '/../plugins/';

module.exports =
{
	init: function (verbose, config)
	{
		var log = function (message) { if (verbose) util.log(message); };
		var debug = function (message) { if (verbose) util.debug(message); };
		log("Examining plugin directory - " + plugins_dir);
		var plugins = fs.readdirSync(plugins_dir);
		// Load any plugin files
		plugins.forEach(function (plugin)
		{
			var plugin_dir = plugins_dir + plugin;
			if (!fs.statSync(plugin_dir).isDirectory()) return;

			// create and load the plugins
			var files = fs.readdirSync(plugin_dir);

			// Check for an area manifest
			var has_init = files.some(function (file) {
				return file.match(/plugin.js/);
			});

			if (!has_init) {
				log("Failed to load plugin - " + plugin + ' - No plugin.js file');
				return;
			}

			log("Loading plugin [" + plugin + "]");
			require(plugin_dir + '/plugin.js').init(config);
			log("Done");
		});

	}
};
