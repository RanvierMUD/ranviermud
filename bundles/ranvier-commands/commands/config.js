'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Parser = require(srcPath + 'CommandParser').CommandParser;
  const Data = require(srcPath + 'Data');

  return {
    usage: 'config <set/list> [setting] [value]',
    command: (state) => (args, player) => {
      args = args.trim();

      if (!args.length) {
        Broadcast.sayAt(player, 'Configure what?');
        return state.CommandManager.get('help').execute('config', player);
      }

      const possibleCommands = ['set', 'list'];
      const splitArgs = args.split(' ');
      const command = splitArgs[0];

      if (possibleCommands.indexOf(command) === -1) {
        Broadcast.sayAt(player, `<red>Invalid config command: ${command}</red>`);
        return state.CommandManager.get('help').execute('config', player);
      }

      if (command === 'list') {
        return listCurrentConfiguration();
      }

      if (splitArgs.length === 1) {
        Broadcast.sayAt(player, 'Set what?');
        return state.CommandManager.get('help').execute('config', player);
      }

      const configToSet = splitArgs[1];
      const possibleSettings = ['brief', 'autoloot'];

      if (possibleSettings.indexOf(configToSet) === -1) {
        Broadcast.sayAt(player, `<red>Invalid setting: ${configToSet}. Possible settings: ${possibleSettings.join(', ')}`);
        return state.CommandManager.get('help').execute('config', player);
      }

      const valueToSet = splitArgs[2];

      if (!valueToSet) {
        Broadcast.sayAt(player, `<red>What value do you want to set for ${configToSet}?</red>`);
        return state.CommandManager.get('help').execute('config', player);
      }

      const possibleValues = [];

      const trueFalse = ['true', 'false'];
      possibleValues['brief'] = trueFalse;
      possibleValues['autoloot'] = trueFalse;

      if (possibleValues[configToSet].indexOf(valueToSet) === -1) {
        return Broadcast.sayAt(player, `<red>Value must be either: ${possibleValues[configToSet].join(', ')}</red>`);
      }

      const playerConfig = Data.load('player', player.name);

      const currentConfig = playerConfig['config'] || {};

      const newConfig = {};

      //We want an actual boolean, not "true" or "false"
      newConfig[configToSet] = valueToSet === "true";

      const finalConfig = Object.assign({}, currentConfig, newConfig);

      playerConfig['config'] = finalConfig;

      Data.save('player', player.name, playerConfig);

      player.setConfig(finalConfig);

      Broadcast.sayAt(player, 'Configuration value saved');

      function listCurrentConfiguration() {
        Broadcast.sayAt(player, 'Current Settings\r\n');
        for (const key in player.config) {
          Broadcast.sayAt(player, `${key} = ${player.config[key]}`);
        }
      }
    }
  };
};

