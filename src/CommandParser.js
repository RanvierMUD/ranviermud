'use strict';

const CommandType = require('./CommandType');

/**
 * Interpreter.. you guessed it, interprets command input
 */
class CommandParser {
  /**
   * Parse a given string to find the resulting command/arguments
   * @param {GameState} state
   * @param {string} data
   * @param {Player} player
   * @return {{
   *   type: CommandType,
   *   command: Command,
   *   skill: Skill,
   *   channel: Channel,
   *   args: string,
   *   originalCommand: string
   * }}
   */
  static parse(state, data, player) {
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
        command: state.CommandManager.get('look'),
        args: args
      };
    }

    // Same with 'i' and inventory.
    if (command === 'i') {
      return {
        type: CommandType.COMMAND,
        command: state.CommandManager.get('inventory'),
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

    const moveCommand = state.Config.get("moveCommand");
    if (command in directions) {
      const direction = directions[command];
      return {
        type: CommandType.COMMAND,
        command: state.CommandManager.get(moveCommand),
        args: direction,
        // Send the equivalent of bash $0 so the command, when executed,
        // can tell which of its aliases was used
        originalCommand: direction
      };
    }

    // See if the command is an exit and the player can go that way
    if (player.canGo(command)) {
      return {
        type: CommandType.COMMAND,
        command: state.CommandManager.get(moveCommand),
        args: command,
        originalCommand: command
      };
    }

    // see if they matched exactly a command
    if (state.CommandManager.get(command)) {
      return {
        type: CommandType.COMMAND,
        command: state.CommandManager.get(command),
        args,
        originalCommand: command
      };
    }

    // see if they typed at least the beginning of a command and try to match
    let found = state.CommandManager.find(command, /* returnAlias: */ true);
    if (found) {
      return {
        type: CommandType.COMMAND,
        command: found.command,
        args,
        originalCommand: found.alias
      };
    }

    // finally check channels
    found = state.ChannelManager.find(command);
    if (found) {
      return {
        type: CommandType.CHANNEL,
        channel: found,
        args
      };
    }

    // finally check channels
    found = state.SkillManager.find(command);
    if (found) {
      return {
        type: CommandType.SKILL,
        skill: found,
        args
      };
    }

    throw new InvalidCommandError();
  }

  /**
   * Parse "get 2.foo bar"
   * @param {string}   search    2.foo
   * @param {Iterable} list      Where to look for the item
   * @param {boolean}  returnKey If `list` is a Map, true to return the KV tuple instead of just the entry
   * @return {*} Boolean on error otherwise an entry from the list
   */
  static parseDot(search, list, returnKey = false) {
    if (!list) {
      return null;
    }

    const parts = search.split('.');
    let findNth = 1;
    let keyword = null;
    if (parts.length > 2) {
      return null;
    }

    if (parts.length === 1) {
      keyword = parts[0];
    } else {
      findNth = parseInt(parts[0], 10);
      keyword = parts[1];
    }

    let encountered = 0;
    for (let entity of list) {
      let key, entry;
      if (list instanceof Map) {
        [key, entry] = entity;
      } else {
        entry = entity;
      }

      if (!('keywords' in entry) && !('name' in entry)) {
        throw new Error('Items in list have no keywords or name');
      }

      // prioritize keywords over item/player names
      if (entry.keywords && (entry.keywords.includes(keyword) || entry.uuid === keyword)) {
        encountered++;
        if (encountered === findNth) {
          return returnKey ? [key, entry] : entry;
        }
        // if the keyword matched skip to next loop so we don't double increment
        // the encountered counter
        continue;
      }

      if (entry.name && entry.name.toLowerCase().includes(keyword)) {
        encountered++;
        if (encountered === findNth) {
          return returnKey ? [key, entry] : entry;
        }
      }
    }

    return false;
  }
}
exports.CommandParser = CommandParser;

/**
 * Used when the player enters a bad command
 * @extends Error
 */
class InvalidCommandError extends Error {}
/**
 * Used when the player tries a command they don't have access to
 * @extends Error
 */
class RestrictedCommandError extends Error {}
exports.InvalidCommandError = InvalidCommandError;
exports.RestrictedCommandError = RestrictedCommandError;
