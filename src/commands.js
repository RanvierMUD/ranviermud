'use strict';
const util    = require('util');

// "Globals" to be specified later during config.
let rooms   = null;
let players = null;
let items   = null;
let npcs    = null;

// constants for command type
const CommandTypes = {
  ADMIN: 1,
  PLAYER: 2,
  SKILL: 3,
  CHANNEL: 4,
};


class Command {
  /**
   * @param {number}   type   One of the CommandTypes constants
   * @param {string}   name   Name of the command
   * @param {string}   bundle Bundle the command came from
   * @param {Function} func   Actual function to run when command is executed
   */
  constructor(type, name, bundle, func) {
    this.type = type;
    this.bundle = bundle;
    this.name = name;
    this.func = func;
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

/**
 * Commands a player can execute go here
 * Each command takes two arguments: a _string_ which is everything the user
 * typed after the command itself, and then the player that typed it.
 */
const Commands = {
  // Built-in player commands
  player_commands: {

    /**
     * Move player in a given direction from their current room
     * TODO: Move into core-commands
     * @param {string} exit   direction they tried to go
     * @param {Player} player
     * @return boolean False if the exit is inaccessible.
     */
    _move: new Command(CommandTypes.PLAYER, 'core-commands', '_move', (exit, player) => {
      const room = rooms.getAt(player.getLocation());
      if (!room) {
        return false;
      }

      const exits = room.getExits().filter( e => e.direction.indexOf(exit) === 0);

      if (!exits.length) {
        return false;
      }

      if (exits.length > 1) {
        throw 'Be more specific. Which way would you like to go?';
        return true;
      }

      if (player.isInCombat()) {
        throw 'You are in the middle of a fight!';
        return true;
      }

      moveCharacter(exits.pop(), player);

      return true;
    }),
  },

  admin_commands: {
  },

  /**
   * Actually instantiate commands by passing in game state
   * @param object config
   */
  configure: function(config) {

    rooms   = config.rooms;
    players = config.players;
    npcs    = config.npcs;
    items   = config.items;

    for (const commandName in Commands.player_commands) {
      const cmd = Commands.player_commands[commandName];
      if (cmd instanceof Command) {
        continue;
      }

      // Command is currently a latent import, hydrated into a full command
      Commands.player_commands[commandName] = new Command(
        cmd.import.type || CommandTypes.PLAYER,
        cmd.bundle,
        cmd.name,
        cmd.import.command(rooms, items, players, npcs, Commands)
      );
    }
  },

  /**
   * @param {string} bundle      Bundle the command came from
   * @param {string} commandName
   * @param {object} cmdImport   Result of require() of the command file
   */
  addCommand: (bundle, commandName, cmdImport) => {
    Commands.player_commands[commandName] = {
      bundle: bundle,
      import: cmdImport,
      name: commandName,
    };
  },

  canPlayerMove: (exit, player) => {
      const room = rooms.getAt(player.getLocation());
      if (!room) {
        return false;
      }

      const exits = room.getExits().filter( e => e.direction.indexOf(exit) === 0);

      if (!exits.length) {
        return false;
      }

      if (exits.length > 1) {
        return false;
      }

      if (player.isInCombat()) {
        return false;
      }

      return true;
  }
};

/**
 * Move helper method
 * TODO: Refactor this to move any character, not just players
 *
 * @param {object} exit   Room.exits object
 * @param {Player} player
 * @return bool Moved (false if the move fails)
 */
function moveCharacter(exit, player) {
  rooms.getAt(player.getLocation()).emit('playerLeave', player, players);

  const room = rooms.getAt(exit.location);
  if (!room) {
    util.log(`WARNING: exit '${exit.location}' is invalid`);
    return true;
  }

  // Send the room leave message
  /* Disabled until creation of Room.broadcast()
  players.eachExcept(player, p => {
    if (CommandUtil.inSameRoom(p, player)) {
      try {
        const exitLeaveMessage = exit.leave_message[p.getLocale()];
        const leaveMessage = exitLeaveMessage ?
          player.getName() + exitLeaveMessage :
          player.getName() + ' leaves.';
        p.say(leaveMessage);
      } catch (e) {
        p.sayL10n('LEAVE', player.getName());
        util.log(e);
      }
      p.prompt();
    }
  });
  */

  player.setLocation(exit.location);

  // Force a re-look of the room
  Commands.player_commands.look.execute(null, player);

  // Trigger the playerEnter event
  // See example in scripts/npcs/1.js
  room.getNpcs()
      .forEach(id => {
        const npc = npcs.get(id);
        if (!npc) { return; }
        npc.emit('playerEnter', room, rooms, player, players, npc, npcs, items);
      });

  room.emit('playerEnter', player, players, rooms);

  // Broadcast player entrance to new room.
  /* Disabled until creation of Room.broadcast()
  players.eachExcept(
    player,
    p => {
      if (CommandUtil.inSameRoom(p, player)) {
        p.say(player.getName() + ' enters.');
      }
  });
  */
  return true;
}

exports.Command = Command,
exports.Commands = Commands,
exports.CommandTypes = CommandTypes
