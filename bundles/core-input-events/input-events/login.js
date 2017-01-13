'use strict';

const util   = require('util');
const crypto = require('crypto');

module.exports = (srcPath) => {
  const Data = require(srcPath + 'Data');
  const EventUtil = require(srcPath + 'EventUtil');
  const Broadcast = require(srcPath + 'Broadcast');
  const Account = require(srcPath + 'Account');

  return {
    event: (state) => {
      // Local variables persisted between stages.
      let account = null;
      let player  = null;

      const passwordAttempts = {};
      return function login(socket, stage, args) {
        stage = stage || 'intro';

        const say    = EventUtil.genSay(socket);
        const next   = EventUtil.genNext('login');
        const repeat = EventUtil.genRepeat(arguments, next);

        switch (stage) {
          case 'intro': {
            const motd = Data.loadMotd();
            if (motd) {
              say(motd);
            }
            return next(socket, 'login');
          }
          case 'login': {
            if (!args || !args.dontwelcome) {
              socket.write("Welcome, what is your name? ");
            }

            // If account, continue to player selection menu
            // Else, continue to account creation menu

            socket.once('data', name => {
              name = name.toString().trim();

              const invalid = Account.validateName(name);
              if (invalid) {
                say(invalid);
                return next(socket, 'login', args);
              }

              name = name[0].toUpperCase() + name.slice(1);

              account = Data.exists('account', name);

              // That player account doesn't exist so ask if them to create it
              if (!account) {
                util.log('No account found');
                return socket.emit('createAccount', socket, 'check', name);
              }

              account = state.AccountManager.loadAccount(name);
              return next(socket, 'password', { dontwelcome: false, account });
            });

            break;
          }
          case 'password': {
            util.log('Password...');
            let name = account.name;

            if (!passwordAttempts[name]) {
              passwordAttempts[name] = 0;
            }

            const maxFailedAttempts = 2;

            // Boot and log any failed password attempts
            if (passwordAttempts[name] > maxFailedAttempts) {
              socket.write("Password attempts exceeded.\r\n");
              passwordAttempts[name] = 0;
              socket.end();
              return false;
            }

            if (!args.dontwelcome) {
              socket.write("Enter your password: ");
              socket.toggleEcho();
            }

            socket.once('data', pass => {
              socket.toggleEcho();

              // TODO: Replace MD5
              pass = crypto.createHash('md5').update(pass.toString('').trim()).digest('hex');

              if (pass !== args.account.password) {
                say('Incorrect password.\r\n');
                passwordAttempts[name]++;

                return repeat();
              }

              return next(socket, 'chooseChar', { account: args.account });
            });
            break;
          }
          case 'chooseChar': {
            let account = args.account;

            const multiplaying = player => player.account.name === name;
            const bootPlayer   = player => {
              player.say("Replaced.");
              player.emit('quit');
              util.log("Replaced: ", player.getName());
              players.removePlayer(player, true);
            };

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
                onSelect: () => socket.emit('createPlayer', socket, null, { account }),
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
                    player.hydrate(state);
                    next(socket, 'done', { player });
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
                return repeat();
              }

              const selection = options.filter(o => !!o.onSelect)[choice];

              if (selection) {
                util.log('Selected ' + selection.display);
                return selection.onSelect();
              }

              return repeat();
            });

            break;
          }

          case 'done': {
            let player = args.player;
            player.socket = socket;
            player.hydrate(state);

            player.socket.on('close', () => {
              util.log(player.name + ' has gone linkdead.');
              // try to fetch the person the player is fighting and dereference the player
              if (player.inCombat.inCombat) {
                player.inCombat.inCombat = null;
              }

              player.save(() => {
                player.room.removePlayer(player);
                state.PlayerManager.removePlayer(player, true);
              });
            });

            state.CommandManager.get('look').execute(null, player);
            Broadcast.prompt(player);

            // All that shit done, let them play!
            player.socket.emit("commands", player);
            break;
          }
        }
      };
    }
  };
};
