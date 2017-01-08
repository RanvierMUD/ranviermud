'use strict';

const util = require('util');
const src      = '../src/';
const { CommandParser, InvalidCommandError } = require(src + 'interpreter');
const CommandTypes = require(src + 'commands').CommandTypes;

exports.event = (players, items, rooms, npcs, accounts) => player => {
  player.getSocket().once('data', data => {
    function loop () {
      player.getSocket().emit('commands', player);
    }
    data = data.toString().trim();
    player.getSocket().write('\r\n');

    if (!data.length) {
      return loop();
    }

    try {
      const result = CommandParser.parse(data, player);
      if (!result) {
        throw null;
      }

      switch (result.type) {
        case CommandTypes.ADMIN:
        case CommandTypes.PLAYER: {
          result.command.execute(result.args, player);
          break;
        }
        case CommandTypes.SKILL: {
          player.useSkill(result.skill, player, result.args, rooms, npcs, players, items);
          break;
        }
        case CommandTypes.CHANNEL: {
          result.channel.use(result.args, player, players, rooms, npcs);
          break;
        }
      }
    } catch (e) {
      if (e instanceof InvalidCommandError) {
        player.say('That is not a valid command');
      }
      util.log(`WARNING: Player tried non-existent command '${data}'`);
    }

    player.prompt();
    loop();
  });
};
