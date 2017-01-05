'use strict';

const fs = require('fs'),
    path = require('path'),
    util = require('util'),
    l10nHelper = require('./l10n'),
		Effect = require('./effect').Effect;

const data_path          = __dirname + '/../data/';
const behaviors_dir      = __dirname + '/../scripts/behaviors/';
const behaviors_l10n_dir = __dirname + '/../l10n/scripts/behaviors/';

const Data = {
	/**
	 * load the MOTD for the intro screen
	 * @return string
	 */
	loadMotd: () => {
		var motd = fs.readFileSync(data_path + 'motd').toString('utf8');
		return motd;
	},

	/**
	 * Load a player's pfile.
	 * This does not instantiate a player, it simply returns data
	 * @param string name Player's name
	 * @return object
	 */
	loadPlayer: name => {
		const playerpath = data_path + 'players/' + name + '.json';
		if (!fs.existsSync(playerpath)) {
			return false;
		}

		return JSON.parse(fs.readFileSync(playerpath).toString('utf8'));
	},

  /**
   * Load a player's account.
   * This does not instantiate an account, it simply returns data
   * @param string name account's name
   * @return object
   */
  loadAccount: name => {
    var accountPath = data_path + 'accounts/' + name + '.json';
    if (!fs.existsSync(accountPath)) {
      return false;
    }

    return JSON.parse(fs.readFileSync(accountPath).toString('utf8'));
  },

	/**
	 * Save a player
	 * @param Player player
	 * @param function callback
	 * @return boolean
	 */
	savePlayer: (player, callback) => {
		fs.writeFileSync(data_path + 'players/' + player.getName() + '.json', player.stringify(), 'utf8');
		if (callback) { callback(); }
	},

  /**
	 * Save a player account
	 * @param Player player
	 * @param function callback
	 * @return boolean
	 */
  saveAccount: (account, callback) => {
    fs.writeFileSync(data_path + 'accounts/' + account.getUsername() + '.json', account.stringify(), 'utf8');
    if (callback) { callback(); }
  },


	/**
	 * Load and set listeners onto an object
	 * @param object config
	 * @param string l10n_dir
	 * @param object target
	 * @return object The applied target
	 */
	loadListeners: (config, l10n_dir, scripts_dir, target) => {

    // Check to see if the target has scripts, if so load them
		if (config.script) {
			const listeners = require(scripts_dir + config.script).listeners;

			// the localization file for the script will be l10n/scripts/<script name>.yml
			// example: l10n/scripts/1.js.yml
			const l10nFile = l10n_dir + config.script + '.yml';
			const l10n = l10nHelper(l10nFile);
			util.log('Loaded script file ' + l10nFile);

			for (let listener in listeners) {
				target.on(listener, listeners[listener](l10n));
			}
		}

		return target;
	},

	/* Loads in stringified effects to persist them.
	 * @param
	 * @return
	*/
	loadEffects: (target, str) => {
		util.log(`Loading in ${target.getShortDesc()}'s effects from: ${str}`);

		if (!str) { return new Map(); }

		let stringifiedEffects;

		try {
			stringifiedEffects = new Map(JSON.parse(str));
		} catch (e) {
			console.log("ERROR: ", e, str);
			stringifiedEffects = new Map();
		}

		const loadedEffects = new Map();
		for (const [id, effectConfig] of stringifiedEffects) {
			const { id, type, options } = effectConfig;
			const effect = new Effect({ id, type, options, target });
			loadedEffects.set(id, effect);
			effect.init();
		}

		return loadedEffects;
	},

	/**
	 * Load and set behaviors (predefined sets of listeners) onto an object
	 * @param object config
	 * @param string subdir The subdirectory of behaviors_dir which the behaviors live
	 * @param object target
	 * @return object The applied target
	 */
	loadBehaviors: (config, subdir, target) => {
		if (config.behaviors) {
			let behaviors = config.behaviors.split(',');

      // reverse to give left-to-right weight in the array
			behaviors.reverse().forEach( behavior => {
				const l10nFile = behaviors_l10n_dir + subdir + behavior + '.yml';
				const l10n = l10nHelper(l10nFile);
				const listeners = require(behaviors_dir + subdir + behavior + '.js').listeners;

        // Warning: Multiple listeners can be added for the same event. All will be triggered.
        for (let listener in listeners) {
          let handler = listeners[listener](l10n);
					target.on(listener, handler);
				}
			});
		}

		return target;
	},
};

exports.Data = Data;
