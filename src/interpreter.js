'use strict';

const { Command, Commands, CommandTypes } = require('./commands');
const Channels = require('./channels').Channels;
const Skills   = require('./skills').Skills;

/**
 * Interpreter.. you guessed it, interprets command input
 */
class CommandParser {
  /**
   * Parse a given string to find the resulting command/arguments
   * @param {String} data
   * @return {command: Command, args: String}
   */
  static parse(data, player) {
    data = data.trim();

    const parts = data.split(' ');

    const command = parts.shift().replace(/[^a-z]/i, '');
    console.log({parts});
    if (!command.length) {
      throw new InvalidCommandError();
    }

    const args = parts.join(' ');

    // Kludge so that 'l' alone will always force a look,
    // instead of mixing it up with lock or list.
    // TODO: replace this a priority list
    if (command === 'l') {
      return {
        type: CommandTypes.PLAYER,
        command: Commands.player_commands.look,
        args: args
      };
    }

    // Same with 'i' and inventory.
    if (command === 'i') {
      return {
        type: CommandTypes.PLAYER,
        command: Commands.player_commands.inventory,
        args: args
      };
    }

    if (command[0] === '@') {
      const adminCommand = command.slice(1);
      if (adminCommand in Commands.admin_commands) {
        return {
          type: CommandTypes.PLAYER,
          command: Commands.admin_commands[adminCommand],
          args: args
        };
      }
    }

    if (command in Commands.player_commands) {
      return {
        type: CommandTypes.PLAYER,
        command: Commands.player_commands[command],
        args: args
      };
    }

    // check for direction shortcuts
    const directions = {
      'n':  'north',
      'e':  'east',
      's':  'south',
      'w':  'west',
      'u':  'up',
      'd':  'down',

      'ne': 'northeast',
      'se': 'southeast',
      'nw': 'northwest',
      'sw': 'southwest',
    };

    if (command.toLowerCase() in directions) {
      const direction = directions[command.toLowerCase()];
      return {
        type: CommandTypes.PLAYER,
        command: Commands.player_commands._move,
        args: direction
      };
    }

    // see if they typed at least the beginning of a command and try to match
    for (let cmd in Commands.player_commands) {
      if (Commands.player_commands[cmd].name.indexOf(command) === 0) {
        return {
          type: CommandTypes.PLAYER,
          command: Commands.player_commands[cmd],
          args
        };
      }
    }

    // check exits
    if (Commands.canPlayerMove(command, player) === true) {
      return {
        type: CommandTypes.PLAYER,
        command: Commands.player_commands._move,
        args: command
      };
    }

    // check skills
    if (command in player.getSkills()) {
      return {
        type: CommandTypes.SKILL,
        skill: command,
        args
      };
    }

    // finally check channels
    if (command in Channels) {
      return {
        type: CommandTypes.CHANNEL,
        channel: Channels[command],
        args
      };
    }

    return null;
  }
}
exports.CommandParser = CommandParser;

class InvalidCommandError extends Error {}
exports.InvalidCommandError = InvalidCommandError;
