'use strict';

const { Broadcast, Config, EventUtil, Logger } = require('ranvier');

/**
 * Account character selection event
 */
module.exports = {
  event: state => (socket, args) => {
    let account = args.account;

    const say = EventUtil.genSay(socket);
    const write = EventUtil.genWrite(socket);

    /*
    Player selection menu:
    * Can select existing player
    * Can create new (if less than 3 living chars)
    */
    say("\r\n------------------------------");
    say("|      Choose your fate");
    say("------------------------------");

    // This just gets their names.
    const characters = account.characters.filter(currChar => currChar.deleted === false);
    const maxCharacters   = Config.get("maxCharacters");
    const canAddCharacter = characters.length < maxCharacters;
    const canMultiplay    = Config.get("allowMultiplay");

    let options = [];

    // Configure account options menu
    options.push({
      display: 'Change Password',
      onSelect: () => {
        socket.emit('change-password', socket, { account, nextStage: 'choose-character' });
      },
    });

    if (canAddCharacter) {
      options.push({
        display: 'Create New Character',
        onSelect: () => {
          handleMultiplaying();
          socket.emit('create-player', socket, { account });
        },
      });
    }

    if (characters.length) {
      options.push({ display: "Login As:" });
      characters.forEach(char => {
        options.push({
          display: char.username,
          onSelect: () => {
            handleMultiplaying(char)
              .then(() => {
                const player = state.PlayerManager.loadPlayer(state, account, char.username);
                player.socket = socket;
                socket.emit('done', socket, { player });
              })
              .catch(err => {
                Logger.warn(err);
                say('Failed to log in to your character. Please contact an administrator.');
                socket.emit('close');
              });
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
        const kickIfMultiplaying = kickIfLoggedIn.bind(null, 'Replaced. No multiplaying allowed.');
        const checkAllCharacters = [...characters].map(kickIfMultiplaying);
        return Promise.all(checkAllCharacters);
      } else if (selectedChar) {
        Logger.log("Multiplaying is allowed...");
        return kickIfLoggedIn("Replaced by a new session.", selectedChar);
      }
    }

    function kickIfLoggedIn(message, character) {
      const otherPlayer = state.PlayerManager.getPlayer(character.username);
      if (otherPlayer) {
        return bootPlayer(otherPlayer, message);
      }
      return Promise.resolve();
    }

    function bootPlayer(player, reason) {
      return new Promise((resolve, reject) => {
        try {
          player.save(() => {
            Broadcast.sayAt(player, reason);
            player.socket.on('close', resolve)
            const closeSocket = true;
            state.PlayerManager.removePlayer(player, closeSocket);
            Logger.warn(`Booted ${player.name}: ${reason}`);
          });
        } catch (err) {
          return reject('Failed to save and close player.');
        }
      });
    }

    options.push({ display: "" });

    if (characters.length) {
      options.push({
        display: 'Delete a Character',
        onSelect: () => {
          socket.emit('delete-character', socket, args);
        },
      });
    }

    options.push({
      display: 'Delete This Account',
      onSelect: () => {
        say('<bold>By deleting this account, all the characters will be also deleted.</bold>')
        write(`<bold>Are you sure you want to delete this account? </bold> <cyan>[Y/n]</cyan> `);
          socket.once('data', confirmation => {
            say('');
            confirmation = confirmation.toString().trim().toLowerCase();

            if (!/[yn]/.test(confirmation)) {
              say('<b>Invalid Option</b>')
              return socket.emit('choose-character', socket, args);
            }

            if (confirmation === 'n') {
              say('No one was deleted...');
              return socket.emit('choose-character', socket, args);
            }

            say(`Deleting account <b>${account.username}</b>`);
            account.deleteAccount();
            say('Account deleted, it was a pleasure doing business with you.');
            socket.end();
          });
      },
    });

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
        Logger.log('Selected ' + selection.display);
        return selection.onSelect();
      }

      return socket.emit('choose-character', socket, args);
    });
  }
};
