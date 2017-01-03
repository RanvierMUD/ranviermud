var fs     = require('fs'),
    util   = require('util');
var plugins_dir = __dirname + '/../plugins/';

module.exports = {
	init(verbose, config) {
		const log   = message => { if (verbose) util.log(message); };
		const debug = message => { if (verbose) util.debug(message); };
		
		log("Examining plugin directory - " + plugins_dir);
		if (!fs.existsSync(plugins_dir)) {
			fs.mkdirSync(plugins_dir);
		}

		const plugins = fs.readdirSync(plugins_dir);
		// Load any plugin files
		plugins.forEach(plugin => {
			const plugin_dir = plugins_dir + plugin;
			if (!fs.statSync(plugin_dir).isDirectory()) return;

			// create and load the plugins
			const files = fs.readdirSync(plugin_dir);

			// Check for an area manifest
			const has_init = files.some(file => file.match(/plugin.js/));

			if (!has_init) {
				return debug("Failed to load plugin - " + plugin + ' - No plugin.js file');
			}

			log("Loading plugin [" + plugin + "]");
			require(plugin_dir + '/plugin.js').init(config);
			log("Done");
		});
	}
};
