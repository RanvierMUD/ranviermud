'use strict';

const util = require('util');

/**
 * Main command loop. All player input after login goes through here.
 * If you want to swap out the command parser this is the place to do it
 */
module.exports = (src) => {
  const { CommandParser, InvalidCommandError } = require(src + 'CommandParser');
  const CommandTypes = require(src + 'CommandType');
  const Broadcast = require(src + 'Broadcast');

  return {
    event: state => player => {
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
            case CommandTypes.SKILL: {
              result.skill.execute(result.args, player);
              break;
            }
          }
        } catch (e) {
          if (e instanceof InvalidCommandError) {
            Broadcast.sayAt(player, "Huh?");
          } else {
            console.log(e);
          }
          util.log(`WARNING: Player tried non-existent command '${data}'`);
        }

        Broadcast.prompt(player);
        loop();
      });
    }
  };
};
