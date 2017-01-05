const fs     = require('fs'),
      util   = require('util');
const pluginsDir = __dirname + '/../plugins/';

module.exports = {
	init(verbose, config) {
		const log   = message => { if (verbose) util.log(message); };
		const debug = message => { if (verbose) util.debug(message); };

		log("Examining plugin directory - " + pluginsDir);
		if (!fs.existsSync(pluginsDir)) {
			fs.mkdirSync(pluginsDir);
		}

		const plugins = fs.readdirSync(pluginsDir);
		// Load any plugin files
		plugins.forEach(plugin => {
			const pluginDir = pluginsDir + plugin;
			if (!fs.statSync(pluginDir).isDirectory()) return;

			// create and load the plugins
			const files = fs.readdirSync(pluginDir);

			// Check for an area manifest
			const hasInit = files.some(file => file.match(/plugin.js/));

			if (!hasInit) {
				return debug("Failed to load plugin - " + plugin + ' - No plugin.js file');
			}

			log("Loading plugin [" + plugin + "]");
			require(pluginDir + '/plugin.js').init(config);
			log("Done");
		});
	}
};
