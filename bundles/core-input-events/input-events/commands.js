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
              // See bundles/core-player-events/player-events.js commandQueued and updateTick for when these
              // actually get executed
              player.queueCommand({
                execute: _ => {
                  player.emit('useSkill', result.skill, result.args);
                },
                label: data,
              }, result.skill.lag || state.Config.get('skillLag') || 1000);
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
