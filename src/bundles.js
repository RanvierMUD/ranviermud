'use strict';

const fs = require('fs'),
    path = require('path'),
    util = require('util'),
    Data = require('./data').Data,
    Commands = require('./commands').Commands
;

const bundlesPath = __dirname + '/../bundles/';

class BundleManager {
  /**
   * Load in all bundles
   */
  static loadBundles() {
    util.log('LOAD: BUNDLES');

    const bundles = fs.readdirSync(bundlesPath);
    for (const bundle of bundles) {
      const bundlePath = bundlesPath + bundle;
      if (fs.statSync(bundlePath).isFile() || bundle === '.' || bundle === '..') {
        continue;
      }

      BundleManager.loadBundle(bundle, bundlePath);
    }

    util.log('ENDLOAD: BUNDLES');
  }

  static loadBundle(bundle, bundlePath) {
    const paths = {
      commands: bundlePath + '/commands/',
    };

    util.log(`LOAD: BUNDLE [${bundle}] START`);
    if (fs.existsSync(paths.commands)) {
      util.log(`LOAD: BUNDLE[${bundle}] Commands...`);
      BundleManager.loadCommands(bundle, paths.commands);
    }
    util.log(`ENDLOAD: BUNDLE [${bundle}]`);
  }

  static loadCommands(bundle, commandsDir) {
    const files = fs.readdirSync(commandsDir);

    for (const commandFile of files) {
      const commandPath = commandsDir + commandFile;
      if (!fs.statSync(commandPath).isFile() || !commandFile.match(/js$/)) {
        continue;
      }

      const commandName = commandFile.split('.')[0];
      util.log(`LOAD: BUNDLE[${bundle}] COMMAND[${commandName}] START`);
      var cmdImport = require(commandPath);

      Commands.addCommand(bundle, commandName, cmdImport);
      util.log(`ENDLOAD: BUNDLE[${bundle}] COMMAND[${commandName}]`);
    }
  }
}

module.exports = BundleManager;
