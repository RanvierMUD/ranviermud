'use strict';

const util = require('util');

/**
 * Account character selection event
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const EventUtil = require(srcPath + 'EventUtil');
  const Config     = require(srcPath + 'Config');

  return {
    event: state => (socket, args) => {
      let account = args.account;

      const say = EventUtil.genSay(socket);

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

      const maxCharacters   = Config.get("maxCharacters");
      const canAddCharacter = characters.length < maxCharacters;
      const canMultiplay    = Config.get("allowMultiplay");


      let options  = [];
      let selected = '';

      // Configure account options menu
      if (canAddCharacter) {
        options.push({
          display: 'Create New Character',
          onSelect: () => { 
            handleMultiplaying();
            socket.emit('create-player', socket, { account })
          },
        });
      }

      if (characters.length) {
        options.push({ display: "Login As:" });
        characters.forEach(char => {
          options.push({
            display: char,
            onSelect: () => {
              handleMultiplaying(char); 
              const player = state.PlayerManager.loadPlayer(state, account, char);
              player.socket = socket;
              socket.emit('done', socket, { player });
            },
          });
        });
      }

      /* 
      If multiplaying is not allowed:
      * Check all PCs on this person's account
      * Kick any that are currently logged-in.
      * Otherwise, have them take over the session
      * if they are logging into a PC that is already on.
      */
      function handleMultiplaying(selectedChar) {
        if (!canMultiplay) {
          for (const character of account.characters) {
            kickIfAccountLoggedIn(character);
          }
        } else if (selectedChar) {
          util.log("Multiplaying is allowed...");
          replaceIfCharLoggedIn(selectedChar);
        }
      }

      function kickIfAccountLoggedIn(character) {
        const otherPlayer = state.PlayerManager.getPlayer(character); 
        if (otherPlayer) {
          bootPlayer(otherPlayer, "Replaced. No multiplaying allowed.");
        }
      }

      function replaceIfCharLoggedIn(selectedChar) {
        const player = state.PlayerManager.getPlayer(selectedChar);
        if (player) {
          bootPlayer(player, "Replaced by a new session.");
        }     
      }

      function bootPlayer(player, reason) {
        player.save(() => {
          util.log(`Booting ${player.name}: ${reason}`);
          Broadcast.sayAt(player, reason);
          player.socket.emit('close');
        });
        state.PlayerManager.removePlayer(player);
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
