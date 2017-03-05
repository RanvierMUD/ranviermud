'use strict';

/**
 * Main command loop. All player input after login goes through here.
 * If you want to swap out the command parser this is the place to do it
 */
module.exports = (src) => {
  const { CommandParser, InvalidCommandError, RestrictedCommandError } = require(src + 'CommandParser');
  const PlayerRoles = require(src + 'PlayerRoles');
  const CommandTypes = require(src + 'CommandType');
  const Broadcast = require(src + 'Broadcast');
  const Logger = require(src + 'Logger');

  return {
    event: state => player => {
      player.socket.once('data', data => {
        function loop () {
          player.socket.emit('commands', player);
        }
        data = data.toString().trim();

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
              if (result.requiredRole && result.requiredRole > player.role) {
                throw new RestrictedCommandError();
              }
              // commands have no lag and are not queued, just immediately execute them
              result.command.execute(result.args, player);
              break;
            }
            case CommandTypes.CHANNEL: {
              // same with channels
              result.channel.send(state, player, result.args);
              break;
            }
            case CommandTypes.SKILL: {
              // See bundles/ranvier-player-events/player-events.js commandQueued and updateTick for when these
              // actually get executed
              player.queueCommand({
                execute: _ => {
                  player.emit('useAbility', result.skill, result.args);
                },
                label: data,
              }, result.skill.lag || state.Config.get('skillLag') || 1000);
              break;
            }
          }
        } catch (error) {
          switch(error) {
            case InvalidCommandError:
              Broadcast.sayAt(player, "Huh?");
              break;
            case RestrictedCommandError:
              Broadcast.sayAt(player, "You can't do that.");
              break;
            default:
              Logger.error(error);
          }

          Logger.warn(`WARNING: Player tried non-existent command '${data}'`);
        }

        Broadcast.prompt(player);
        loop();
      });
    }
  };
};
