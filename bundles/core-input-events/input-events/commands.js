'use strict';

const util = require('util');

module.exports = (src) => {
  const { CommandParser, InvalidCommandError } = require(src + 'CommandParser');
  const CommandTypes = require(src + 'CommandType');
  const Broadcast = require(src + 'Broadcast');

  return {
    event: (state) => player => {
      player.socket.once('data', data => {
        function loop () {
          player.socket.emit('commands', player);
        }
        data = data.toString().trim();
        Broadcast.sayAt(player, '');

        if (!data.length) {
          return loop();
        }

        try {
          const result = CommandParser.parse(state, data, player);
          if (!result) {
            throw null;
          }

          switch (result.type) {
            case CommandTypes.COMMAND: {
              result.command.execute(result.args, player);
              break;
            }
            case CommandTypes.CHANNEL: {
              result.channel.send(state, player, result.args);
              break;
            }
          }
        } catch (e) {
          if (e instanceof InvalidCommandError) {
            player.say('That is not a valid command');
          }
          util.log(`WARNING: Player tried non-existent command '${data}'`);
          console.log(e);
        }

        Broadcast.prompt(player);
        loop();
      });
    }
  };
};
