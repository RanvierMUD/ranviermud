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

module.exports = (srcPath) => {
  const EventUtil = require(srcPath + 'EventUtil');
  const Player = require(srcPath + 'Player');

  return {
    event : (state) => (socket, stage, args) => {
      stage = stage || 'name';

      const next   = EventUtil.genNext('createPlayer');
      const repeat = EventUtil.genRepeat(arguments, next);
      const say    = EventUtil.genSay(socket);
      const write  = EventUtil.genWrite(socket);

      /* Multi-stage character creation i.e., races, classes, etc.
       * Always emit 'done' in your last stage to keep it clean
       * Also try to put the cases in order that they happen during creation
       */

      switch (stage) {
        case 'name': {
          write("<bold>What would you like to name your character?</bold> ");
          socket.once('data', name => {
            say('');
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

            const exists = state.PlayerManager.exists(name);

            if (exists) {
              say(`That name is already taken.`);
              return repeat();
            }

            return next(socket, 'check', { name, account: args.account });
          });
          break;
        }
        case 'check': {
          write(`<bold>${args.name} doesn't exist, would you like to create it?</bold> <cyan>[y/n]</cyan> `);
          socket.once('data', confirmation => {
            say('');
            confirmation = confirmation.toString().trim().toLowerCase();

            if (!/[yn]/.test(confirmation)) {
              return repeat();
            }

            if (confirmation === 'n') {
              say(`Let's try again...`);
              return next(socket, 'name', args);
            }

            return next(socket, 'create', args);
          });

          break;
        }
        case 'create': {
          say('Creating character...');
          let player = new Player({
            name: args.name,
            account: args.account
          });
          player.socket = socket;

          args.account.addCharacter(args.name);
          args.account.save();

          next(socket, 'done', { player });

          break;
        }
        case 'done': {
          // TODO: Don't do this
          let room = Array.from(state.RoomManager.rooms.values())[0];
          args.player.room = room;
          room.addPlayer(args.player);

          // create the pfile then send them on their way
          args.player.save(() => {
            state.PlayerManager.addPlayer(args.player);
            state.CommandManager.get('look').execute('', args.player);
            Broadcast.prompt(args.player);
            args.player.socket.emit('commands', player.socket);
          });

          util.log("A NEW CHALLENGER APPROACHES: ", player.socket);
          break;
        }
      }
    }
  };
};

