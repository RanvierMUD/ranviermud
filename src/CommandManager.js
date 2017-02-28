'use strict';

class CommandManager {
  constructor() {
    this.commands = new Map();
  }

  get(command) {
    return this.commands.get(command);
  }

  add(command) {
    this.commands.set(command.name, command);
    if (command.aliases) {
      command.aliases.forEach(alias => this.commands.set(alias, command));
    }
  }

  remove(command) {
    this.commands.delete(command.name);
  }

  /**
   * @param {string} search
   * @return {Command}
   */
  find(search) {
    for (const [ name, command ] of this.commands.entries()) {
      if (name.indexOf(search) === 0) {
        return command;
      }
    }
  }
}

module.exports = CommandManager;
