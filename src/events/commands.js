'use strict';

const util   = require('util');

const EventUtil   = require('./event_util').EventUtil;
const Data        = require('../data').Data;
const CommandUtil = require('../command_util').CommandUtil;
const Player      = require('../player').Player;
const Account     = require('../accounts').Account;
const Type        = require('../type').Type;
const Commands    = require('../commands').Commands;


exports.event = (players, items, rooms, npcs, accounts, l10n) => function commandLoop(player) {

  player.getSocket()
    .once('data', data => {
      data = data.toString().trim();

      const isCommand = data ? parseCommands(data) : false;
      if (isCommand !== false) { commandPrompt(); }

      /* Parse order is:
       * look shortcut
       * admin commands
       * common direction shortcuts
       * commands
       * exits
       * skills/feats
       * channels
       */

      function parseCommands(data) {
        const command = data
          .split(' ')
          .shift();
        const args = data
          .split(' ')
          .slice(1)
          .join(' ');

        let found = false;

        // Kludge so that 'l' alone will always force a look,
        // instead of mixing it up with lock.
        if (command === 'l') {
          return Commands.player_commands.look(args, player);
        }

        if (command[0] === '@') {
          const adminCommand = command.slice(1);
          if (adminCommand in Commands.admin_commands) {
            Commands.admin_commands[adminCommand](player, args);
            return;
          }
        }

        if (!(command in Commands.player_commands)) {

          found = checkForDirectionAlias(command);
          if (!found) { found = checkForCommandSafely(command); }
          else if (found === true) { return; }

          if (found) { return executeCommand(found, args); }
          else { return checkForSpecializedCommand(command, args); }

        } else { return executeCommand(command, args); }
      }

      function executeCommand(cmd, args) {
        try {
          return Commands.player_commands[cmd](args, player);
        } catch (e) {
          util.log(cmd);
          util.log(e);
        }
      }

      function checkForDirectionAlias(command) {
        var directions = {
          'n': 'north',
          'e': 'east',
          's': 'south',
          'w': 'west',
          'u': 'up',
          'd': 'down'
        };

        if (command.toLowerCase() in directions) {
          const exit = directions[command.toLowerCase()];
          Commands.room_exits(exit, player);
          return true;
        }
      }


      function checkForCommandSafely(command) {
        for (var cmd in Commands.player_commands) {
          try {
            var regex = new RegExp("^" + command);
          } catch (err) {
            continue;
          }
          if (cmd.match(regex)) {
            return cmd;
          }
        }
      }

      // Handles skills, feats, exits
      function checkForSpecializedCommand(command, args) {
        var exit = Commands.room_exits(command, player);

        //TODO: Refactor as to not rely on negative conditionals as much?
        if (exit === false) {
          var isSkill = command in player.getSkills();
          var isFeat = command in player.getFeats();

          if (!isSkill && !isFeat) {
            if (!(command in Channels)) {
              player.say(command + " is not a valid command.");
              return true;
            } else {
              Channels[command].use(args, player, players, rooms);
              return true
            }
          } else {
            var use = isSkill ? player.useSkill : player.useFeat;
            use(command, player, args, rooms, npcs, players);
            return true;
          }
        }
      }

      function commandPrompt() {
        player.prompt();
        player.getSocket()
          .emit("commands", player);
      }

    });
}
