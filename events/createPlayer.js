'use strict';

/**
 * Create a player
 * Stages:
 *   check:  See if they actually want to create a player or not
 *   name:   ... get their name
 *   done:   This is always the end step, here we register them in with
 *           the rest of the logged in players and where they log in
 *
 * @param object arg This is either a Socket or a Player depending on
 *                  the stage.
 * @param string stage See above
 */

const util = require('util');

const src       = '../src/';
const EventUtil = require('./event_util').EventUtil;
const Player    = require(src + 'player').Player;
const Data      = require(src + 'data').Data;
const Commands  = require(src + 'commands').Commands;

const _ = require(src + 'helpers');

exports.event = (players, items, rooms, npcs, accounts, l10n) =>
  function createPlayer(socket, stage, account, name) {
    stage = stage || 'name';

    const say = EventUtil.gen_say(socket);
    l10n.setLocale("en");

    const next   = EventUtil.gen_next('createPlayer');
    const repeat = EventUtil.gen_repeat(arguments, next);

    /* Multi-stage character creation i.e., races, classes, etc.
     * Always emit 'done' in your last stage to keep it clean
     * Also try to put the cases in order that they happen during creation
     */

    switch (stage) {
      case 'name': {
        say("<bold>What would you like to name your character?</bold> ");
        socket.once('data', name => {
          name = name.toString().trim();
          name = name[0].toUpperCase() + name.slice(1);

          const invalid = validate(name);

          // TODO: Refactor to share validation logic with `login` event handler
          function validate(name) {
            if (name.length > 20) {
              return 'Too long, try a shorter name.';
            }
            if (name.length < 3) {
              return 'Too short, try a longer name.';
            }
            return false;
          }

          if (invalid) {
            say(invalid);
            return repeat();
          }

          const exists = players.getByName(name) || Data.loadPlayer(name);

          if (exists) {
            say(`That name is already taken.`);
            return repeat();
          }

          return next(socket, 'check', account, name);
        });
        break;
      }
      case 'check': {
        say(`<bold>${name} doesn't exist, would you like to create it?</bold> <cyan>[y/n]</cyan> `);
        socket.once('data', confirmation => {
          confirmation = confirmation.toString().trim().toLowerCase();

          if (!/[yn]/.test(confirmation)) {
            return repeat();
          }

          if (confirmation === 'n') {
            say(`Let's try again...`);
            return socket.emit('createPlayer', socket, 'name');
          }

          return next(socket, 'create', account, name);
        });

        break;
      }
      case 'create': {
        say('Creating character...');
        socket = new Player(socket);

        socket.setName(name);
        socket.setAccountName(account.getUsername());

        //FIXME: Kludgey.
        // Save player, then load in order to init.
        socket.save();
        socket.load(Data.loadPlayer(name));

        account.addCharacter(name);
        account.save();

        next(socket, 'gender');

        break;
      }
      case 'gender': {
        const genders = ['m', 'f', 'o'];

        say(`<bold>What is your character's gender?</bold>
        <cyan>
        [F]emale
        [M]ale
        [O]ther
        </cyan>`);

        socket.getSocket()
          .once('data', gender => {
            gender = gender
              .toString()
              .trim()
              .toLowerCase();

            if (!gender || _.hasNot(genders, gender)) {
              say('Please specify a gender, or <cyan>[O]ther</cyan> if you\'d prefer.');
              return repeat();
            }

            socket.setGender(gender);
            next(socket, 'done');
          });
        break;
      }
      case 'done': {
        socket.setLocale("en");
        socket.setLocation(players.getDefaultLocation());

        // create the pfile then send them on their way
        socket.save(() => {
          players.addPlayer(socket);
          Commands.player_commands.look('', socket);
          socket.prompt();
          socket.getSocket().emit('commands', socket);
        });

        util.log("A NEW CHALLENGER APPROACHES: ", socket);
        break;
      }
    }
  }
