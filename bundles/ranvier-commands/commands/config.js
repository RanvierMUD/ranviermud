'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Parser = require(srcPath + 'CommandParser').CommandParser;
  const Data = require(srcPath + 'Data');

  return {
    usage: 'config <set/list> [setting] [value]',
    aliases: ['toggle', 'options', 'set'],
    command: (state) => (args, player) => {
      if (!args.length) {
        Broadcast.sayAt(player, 'Configure what?');
        return state.CommandManager.get('help').execute('config', player);
      }

      const possibleCommands = ['set', 'list'];

      const [command, configToSet, valueToSet ] = args.split(' ');

      if (!possibleCommands.includes(command)) {
        Broadcast.sayAt(player, `<red>Invalid config command: ${command}</red>`);
        return state.CommandManager.get('help').execute('config', player);
      }

      if (command === 'list') {
        Broadcast.sayAt(player, 'Current Settings:');
        for (const key in player.metadata.config) {
          const val = player.metadata.config[key] ? 'on' : 'off';
          Broadcast.sayAt(player, `  ${key}: ${val}`);
        }
        return;
      }

      if (!configToSet) {
        Broadcast.sayAt(player, 'Set what?');
        return state.CommandManager.get('help').execute('config', player);
      }

      const possibleSettings = ['brief', 'autoloot', 'minimap'];

      if (!possibleSettings.includes(configToSet)) {
        Broadcast.sayAt(player, `<red>Invalid setting: ${configToSet}. Possible settings: ${possibleSettings.join(', ')}`);
        return state.CommandManager.get('help').execute('config', player);
      }

      if (!valueToSet) {
        Broadcast.sayAt(player, `<red>What value do you want to set for ${configToSet}?</red>`);
        return state.CommandManager.get('help').execute('config', player);
      }

      const possibleValues = {
        on: true,
        off: false
      };

      if (possibleValues[valueToSet] === undefined) {
        return Broadcast.sayAt(player, `<red>Value must be either: on / off</red>`);
      }

      if (!player.getMeta('config')) {
        player.setMeta('config', {});
      }

      player.setMeta(`config.${configToSet}`, possibleValues[valueToSet]);

      Broadcast.sayAt(player, 'Configuration value saved');

      function listCurrentConfiguration() {
      }
    }
  };
};

