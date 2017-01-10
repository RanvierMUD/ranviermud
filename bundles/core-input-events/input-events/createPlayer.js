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
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    event : (state) => (socket, stage, args) => {
      stage = stage || 'name';

      const next   = EventUtil.genNext('createPlayer');
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
              if (!/^[a-z]+$/i.test(name)) {
                return 'Your name may only contain A-Z without spaces or special characters.';
              }
              return false;
            }

            if (invalid) {
              say(invalid);
              return next(socket, 'name', args);
            }

            const exists = state.PlayerManager.exists(name);

            if (exists) {
              say(`That name is already taken.`);
              return next(socket, 'name', args);
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
              return next(socket, 'check', args);
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
          // TODO: Don't do this
          let room = Array.from(state.RoomManager.rooms.values())[0];
          player.room = room;
          room.addPlayer(player);
          state.PlayerManager.addPlayer(player);

          // create the pfile then send them on their way
          player.save(() => {
            socket.emit('login', socket, 'done', { player });
          });
          break;
        }
      }
    }
  };
};

