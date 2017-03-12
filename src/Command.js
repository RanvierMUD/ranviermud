'use strict';

const CommandType = require('./CommandType');
const PlayerRoles = require('./PlayerRoles');

class Command {
  /**
   * @param {CommandType} type One of the CommandTypes
   * @param {string}   name   Name of the command
   * @param {string}   bundle Bundle the command came from
   * @param {Function} func   Actual function to run when command is executed
   */
  constructor(bundle, name, def) {
    this.bundle = bundle;
    this.type = def.type || CommandType.COMMAND;
    this.name = name;
    this.func = def.command;
    this.aliases = def.aliases;
    this.usage = def.usage || this.name;
    this.requiredRole = def.requiredRole || PlayerRoles.PLAYER;
  }

  /**
   * @param {string} args   A string representing anything after the command itself from what the user typed
   * @param {Player} player Player that executed the command
   * @param {string} arg0   The actual command the user typed, useful when checking which alias was used for a command
   * @return {*}
   */
  execute(args, player, arg0) {
    return this.func(args, player, arg0);
  }

}

module.exports = Command;
