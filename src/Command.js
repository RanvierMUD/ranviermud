'use strict';

const CommandType = require('./CommandType');
const PlayerRoles = require('./PlayerRoles');

/**
 * In game command. See the {@link http://ranviermud.com/extending/commands/|Command guide}
 * @property {string} bundle Bundle this command came from
 * @property {CommandType} type
 * @property {string} name
 * @property {function} func Actual function that gets run when the command is executed
 * @property {Array<string>} aliases
 * @property {string} usage
 * @property {PlayerRoles} requiredRole
 */
class Command {
  /**
   * @param {string} bundle Bundle the command came from
   * @param {string} name   Name of the command
   * @param {object} def
   * @param {CommandType} def.type=CommandType.COMMAND
   * @param {function} def.command
   * @param {Array<string>} def.aliases
   * @param {string} def.usage=this.name
   * @param {PlayerRoles} requiredRole=PlayerRoles.PLAYER
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
