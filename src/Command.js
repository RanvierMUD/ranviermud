'use strict';

class Command {
  /**
   * @param {CommandType} type One of the CommandTypes
   * @param {string}   name   Name of the command
   * @param {string}   bundle Bundle the command came from
   * @param {Function} func   Actual function to run when command is executed
   */
  constructor(type, bundle, name, func, aliases) {
    this.type = type;
    this.bundle = bundle;
    this.name = name;
    this.func = func;
    this.aliases = aliases;
  }

  /**
   * @param {String} args A string representing anything after the command
   *  itself from what the user typed
   * @param {Player} player Player that executed the command
   * @return {*}
   */
  execute(args, player) {
    return this.func(args, player);
  }
}

module.exports = Command;
