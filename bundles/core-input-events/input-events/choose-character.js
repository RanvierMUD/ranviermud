'use strict';

const util = require('util');

/**
 * Account character selection event
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const EventUtil = require(srcPath + 'EventUtil');

  return {
    event: state => (socket, args) => {
      let account = args.account;

      const say = EventUtil.genSay(socket);

      // check to see if they have another character logged in, if so boot them
      for (const character of account.characters) {
        let otherPlayer = state.PlayerManager.getPlayer(character);
        if (otherPlayer) {
          Broadcast.sayAt(otherPlayer, "Replaced.");
          otherPlayer.emit('quit');
          util.log(`Replaced: ${otherPlayer.name}`);
          state.PlayerManager.removePlayer(otherPlayer);
        }
      }

      /*
      Player selection menu:
      * Can select existing player
      * Can create new (if less than 3 living chars)
      */
      say("\r\n------------------------------");
      say("|      Choose your fate");
      say("------------------------------");

      // This just gets their names.
      const characters = account.characters;

      const maxCharacters   = 3;
      const canAddCharacter = characters.length < maxCharacters;

      let options  = [];
      let selected = '';

      // Configure account options menu
      if (canAddCharacter) {
        options.push({
          display: 'Create New Character',
          onSelect: () => socket.emit('create-player', socket, { account }),
        });
      }

      if (characters.length) {
        options.push({ display: "Login As:" });
        characters.forEach(char => {
          options.push({
            display: char,
            onSelect: () => {
              let player = state.PlayerManager.loadPlayer(account, char);
              player.socket = socket;
              socket.emit('done', socket, { player });
            },
          });
        });
      }

      options.push({ display: "" });
      options.push({
        display: 'Quit',
        onSelect: () => socket.end(),
      });

      // Display options menu

      let optionI = 0;
      options.forEach((opt) => {
        if (opt.onSelect) {
          optionI++;
          say(`| <cyan>[${optionI}]</cyan> ${opt.display}`);
        } else {
          say(`| <bold>${opt.display}</bold>`);
        }
      });

      socket.write('|\r\n`-> ');

      socket.once('data', choice => {
        choice = choice.toString().trim();
        choice = parseInt(choice, 10) - 1;
        if (isNaN(choice)) {
          return socket.emit('choose-character', socket, args);
        }

        const selection = options.filter(o => !!o.onSelect)[choice];

        if (selection) {
          util.log('Selected ' + selection.display);
          return selection.onSelect();
        }

        return socket.emit('choose-character', socket, args);
      });
    }
  };
};
