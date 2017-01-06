'use strict';
const util    = require('util'),
  ansi        = require('sty').parse,
  fs          = require('fs'),
  CommandUtil = require('./command_util').CommandUtil,
  l10nHelper  = require('./l10n');

const Doors = require('./doors').Doors;
const _     = require('./helpers');

// "Globals" to be specified later during config.
let rooms   = null;
let players = null;
let items   = null;
let npcs    = null;

/**
 * Localization
 */
let l10n       = null;
const l10nFile = __dirname + '/../l10n/commands.yml';

// shortcut for l10n.translate
let L = null;

const commands_dir = __dirname + '/../commands/';

// constants for command type
const CommandTypes = {
  ADMIN: 0,
  PLAYER: 1,
  SKILL: 2,
  CHANNEL: 3,
};


class Command {
  /**
   * @param {number} type One of the CommandTypes constants
   * @param {String} name Name of the command
   * @param {Function} func Actual function to run when command is executed
   */
  constructor(type, name, func) {
    this.type = type;
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
     * @param string exit direction they tried to go
     * @param Player player
     * @return boolean False if the exit is inaccessible.
     */
    _move: new Command(CommandTypes.PLAYER, '_move', (exit, player) => {

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
   * Configure the commands by using a joint players/rooms array
   * and loading the l10n. The config object should look similar to
   * {
   *   rooms: instanceOfRoomsHere,
   *   players: instanceOfPlayerManager,
   *   locale: 'en'
   * }
   * @param object config
   */
  configure: function(config) {

    rooms   = config.rooms;
    players = config.players;
    npcs    = config.npcs;
    items   = config.items;

    util.log("Loading command l10n... ");
    l10n = l10nHelper(l10nFile);
    l10n.setLocale("en");
    util.log("Done");

    /**
     * Hijack translate to also do coloring
     * @param string text
     * @param ...
     * @return string
     */
    L = text => {
      return ansi(l10n.translate.apply(null, [].slice.call(arguments)));
    };

    // Load external commands
    fs.readdir(commands_dir, (err, files) => {
      for (const name in files) {
        const filename = files[name];
        const commandFile = commands_dir + filename;
        if (!fs.statSync(commandFile).isFile()) { continue; }
        if (!commandFile.match(/js$/)) { continue; }

        const commandName = filename.split('.')[0];

        var cmdImport = require(commandFile) ;

        Commands.player_commands[commandName] = new Command(
          typeof cmdImport.type !== undefined ? cmdImport.type : CommandTypes.PLAYER,
          commandName,
          cmdImport.command(rooms, items, players, npcs, Commands)
        );
      }
    });
  },

  setLocale: locale => l10n.setLocale(locale),

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
    player.sayL10n(l10n, 'LIMBO');
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
        p.sayL10n(l10n, 'LEAVE', player.getName());
        util.log(e);
      }
      p.prompt();
    }
  });
  */

  player.setLocation(exit.location);

  // Force a re-look of the room
  Commands.player_commands.look(null, player);

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
