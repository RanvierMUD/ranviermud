'use strict';

const CommandType = require('./CommandType');

/**
 * Interpreter.. you guessed it, interprets command input
 */
class CommandParser {
  /**
   * Parse a given string to find the resulting command/arguments
   * @param {String} data
   * @return {command: Command, args: String}
   */
  static parse(CommandManager, data, player) {
    data = data.trim();

    const parts = data.split(' ');

    const command = parts.shift().replace(/[^a-z]/i, '').toLowerCase();
    if (!command.length) {
      throw new InvalidCommandError();
    }

    const args = parts.join(' ');

    // Kludge so that 'l' alone will always force a look,
    // instead of mixing it up with lock or list.
    // TODO: replace this a priority list
    if (command === 'l') {
      return {
        type: CommandType.COMMAND,
        command: CommandManager.get('look'),
        args: args
      };
    }

    // Same with 'i' and inventory.
    if (command === 'i') {
      return {
        type: CommandType.COMMAND,
        command: CommandManager.get('inventory'),
        args: args
      };
    }

    if (CommandManager.get(command)) {
      return {
        type: CommandType.COMMAND,
        command: CommandManager.get(command),
        args
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

    if (command in directions) {
      const direction = directions[command];
      return {
        type: CommandType.COMMAND,
        command: CommandManager.get('_move'),
        args: direction
      };
    }

    // See if the command is an exit and the player can go that way
    if (player.canGo(command)) {
      return {
        type: CommandType.COMMAND,
        command: CommandManager.get('_move'),
        args: command
      };
    }

    // see if they typed at least the beginning of a command and try to match
    let found = CommandManager.find(command);
    if (found) {
      return {
        type: CommandType.COMMAND,
        command: found,
        args
      };
    }

    return;
    // TODO
    // check skills
    if (command in player.getSkills()) {
      return {
        type: CommandType.SKILL,
        skill: command,
        args
      };
    }

    // finally check channels
    if (command in Channels) {
      return {
        type: CommandType.CHANNEL,
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
