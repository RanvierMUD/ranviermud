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
      case 'name':
        say("<bold>What would you like to name your character?</bold> ");
        socket.once('data', name => {

          if (!EventUtil.isNegot(name)) {
            return repeat();
          }

          name = EventUtil.capitalize(name
            .toString()
            .trim());

          const invalid = validate(name);

          //TODO: Put any player name whitelisting/blacklisting here.
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
            socket.write(invalid + '\r\n');
            return repeat();
          } else {

            const exists = players.getByName(name) || Data.loadPlayer(name);

            if (exists) {
              socket.write('That name is already taken.\r\n');
              return repeat();
            } else {
              return next(socket, 'check', account, name);
            }
          }
        });
      break;

      case 'check':
        say("<bold>" + name + " doesn't exist, would you like to create it?</bold> <cyan>[y/n]</cyan> ");
        socket.once('data', check => {
          check = check.toString()
            .trim()
            .toLowerCase();

          if (!/[yn]/.test(check)) {
            return repeat();
          }

          if (check === 'n') {
            socket.write("Let's try again...\r\n");
            return socket.emit('createPlayer', socket, 'name');
          }

          return next(socket, 'create', account, name);
        });
        break;

      case 'create':
        socket.write('Creating character...');
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

      case 'gender':
        const validGenders = ['m', 'f', 'a'];

        say('<bold>What is your character\'s gender?</bold>\n'
        + '<cyan>[F]emale\n[M]ale\n[A]ndrogynous</cyan>\n');

        socket.getSocket()
          .once('data', gender => {
            gender = gender
              .toString()
              .trim()
              .toLowerCase();

            if (!gender || validGenders.indexOf(gender) === -1) {
              socket.say('Please specify a gender, or [A]ndrogynous if you\'d prefer.');
              return repeat();
            }

            socket.setGender(gender);
            next(socket, 'done');
          });
        break;

        // 'done' assumes the argument passed to the event is a player, ...so always do that.
      case 'done':
        socket.setLocale("en");
        socket.setLocation(players.getDefaultLocation());

        // create the pfile then send them on their way
        socket.save(() => {
          players.addPlayer(socket);
          socket.prompt();
          socket.getSocket()
            .emit('commands', socket);
        });

        util.log("A NEW CHALLENGER APPROACHES: ", socket);
        break;

    }
  }
