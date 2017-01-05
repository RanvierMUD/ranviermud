'use strict';

/**
 * Command loop
 * @param Player player
 */

const util   = require('util');

const src      = '../src/';
const EventUtil   = require('./event_util').EventUtil;
const Data        = require(src + 'data').Data;
const CommandUtil = require(src + 'command_util').CommandUtil;
const Player      = require(src + 'player').Player;
const Commands    = require(src + 'commands').Commands;
const Channels    = require(src + 'channels').Channels;
const Skills      = require(src + 'skills').Skills;

exports.event = (players, items, rooms, npcs, accounts, l10n) =>
  function commandLoop(player) {

    player.getSocket()
      .once('data', data => {
        data = data.toString().trim();

        const isCommand = data ? parseCommands(data) : false;
        commandPrompt();

        /* Parse order is:
         * look shortcut
         * inventory shortcut
         * admin commands
         * common direction shortcuts
         * commands
         * exits
         * skills
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
          // instead of mixing it up with lock or list.
          if (command === 'l') {
            return Commands.player_commands.look(args, player);
          }

          // Same with 'i' and inventory.
          if (command === 'i') {
            return Commands.player_commands.inventory(args, player);
          }

          if (command[0] === '@') {
            const adminCommand = command.slice(1);
            if (adminCommand in Commands.admin_commands) {
              try { Commands.admin_commands[adminCommand](player, args); }
              catch(e) { 
                util.log(adminCommand + ' Admin Command ERROR:');
                console.log(e)
              }
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
            util.log('Command failed: ', cmd);
            util.log(e);
            if (e.stack) { util.log(e.stack); }
          }
        }

        function checkForDirectionAlias(command) {
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

          if (command.toLowerCase() in directions) {
            const exit = directions[command.toLowerCase()];
            return Commands.room_exits(exit, player);
          }
        }


        function checkForCommandSafely(command) {
          for (let cmd in Commands.player_commands) {
            let regex;
            try {
              regex = new RegExp("^" + command);
            } catch (err) {
              util.log('Error in checking for command: ', err);
              util.log('-> ', cmd, command);
              continue;
            }
            if (regex && cmd.match(regex)) {
              return cmd;
            }
          }
        }

        // Handles skills and exits
        function checkForSpecializedCommand(command, args) {
          const exit = Commands.room_exits(command, player);

          //TODO: Refactor as to not rely on negative conditionals as much?
          if (exit === false) {
            const isSkill = command in player.getSkills();

            if (!isSkill) {
              if (!(command in Channels)) {
                player.say(command + " is not a valid command.");
                return true;
              } else {
                Channels[command].use(args, player, players, rooms, npcs);
                return true
              }
            } else {
              player.useSkill(command, player, args, rooms, npcs, players, items);
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
  };
