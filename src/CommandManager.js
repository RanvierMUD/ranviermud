'use strict';

/**
 * Contains all active in game commands
 */
class CommandManager {
  constructor() {
    this.commands = new Map();
  }

  /**
   * Get command by name
   * @param {string}
   * @return {Command}
   */
  get(command) {
    return this.commands.get(command);
  }

  /**
   * Add the command and set up aliases
   * @param {Command}
   */
  add(command) {
    this.commands.set(command.name, command);
    if (command.aliases) {
      command.aliases.forEach(alias => this.commands.set(alias, command));
    }
  }

  /**
   * @param {Command}
   */
  remove(command) {
    this.commands.delete(command.name);
  }

  /**
   * Find a command from a partial name
   * @param {string} search
   * @param {boolean} returnAlias true to also return which alias of the command was used
   * @return {Command}
   */
  find(search, returnAlias) {
    for (const [ name, command ] of this.commands.entries()) {
      if (name.indexOf(search) === 0) {
        return returnAlias ? { command, alias: name } : command;
      }
    }
  }
}

module.exports = CommandManager;
