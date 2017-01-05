'use strict';

/**
 * Point of entry for the player. They aren't actually a player yet
 * @param Socket telnet socket
 */

const util   = require('util');
const crypto = require('crypto');

const src       = '../src/';
const EventUtil   = require('./event_util').EventUtil;
const Data        = require(src + 'data').Data;
const CommandUtil = require(src + 'command_util').CommandUtil;
const Player      = require(src + 'player').Player;
const Account     = require(src + 'accounts').Account;
const Type        = require(src + 'type').Type;
const Commands    = require(src + 'commands').Commands;
const Item        = require(src + 'items').Item;
const _           = require(src + 'helpers');

const passwordAttempts = {};

exports.event = (players, items, rooms, npcs, accounts, l10n) => {

  // Local variables persisted between stages.
  let account = null;
  let player  = null;

  return function login(socket, stage, dontwelcome, name) {

    socket.on('error', err => util.log('error: ', err));

    util.log("Login event detected... ", stage);

    dontwelcome = EventUtil.swallowGarbage(dontwelcome);
    stage = stage || 'intro';

    if (Type.isPlayer(socket)) {
      l10n.setLocale('en');
    }

    const say    = EventUtil.gen_say(socket);
    const next   = EventUtil.gen_next('login');
    const repeat = EventUtil.gen_repeat(arguments, next);

    switch (stage) {

      case 'intro':
        const motd = Data.loadMotd();
        if (motd) { socket.write(motd); }
        return next(socket, 'login');

      case 'login':
        if (!dontwelcome) {
          socket.write("Welcome, what is your name? ");
        }

        //      If account, continue to player selection menu
        //      Else, continue to account creation menu

        socket.once('data', name => {

          if (!EventUtil.isNegot(name)) {
            return next(socket, 'login', true);
          }

          name = name
            .toString()
            .trim();

          //TODO: Blacklist/whitelist names here.
          //TODO: Put name validation functions in module
          if (/[^a-z]/i.test(name) || !name) {
            socket.write("That's not really your name, now is it?\r\n");
            return repeat();
          }

          name = _.capitalize(name);

          let accountExists = Data.loadAccount(name);

          // That player doesn't exist so ask if them to create it
          if (!accountExists) {
            util.log('No account found');
            return socket.emit('createAccount', socket, 'check', name);
          }

          return next(socket, 'password', false, name);
        });
        break;

      case 'password':

        util.log('Password...');

        if (!passwordAttempts[name]) {
          passwordAttempts[name] = 0;
        }

        const maxFailedAttempts = 2;

        // Boot and log any failed password attempts
        if (passwordAttempts[name] > maxFailedAttempts) {
          socket.write("Password attempts exceeded.\r\n");
          passwordAttempts[name] = 0;
          util.log('Failed login - exceeded password attempts - ' + name);
          socket.end();
          return false;
        }

        util.log('dontwelcome: ', dontwelcome);
        if (!dontwelcome) {
          socket.write("Enter your password: ");
          socket.toggleEcho();
        }

        socket.once('data', pass => {
          socket.toggleEcho();

          pass = crypto
            .createHash('md5')
            .update(pass.toString('').trim())
            .digest('hex');

          if (pass !== Data.loadAccount(name).password) {
            util.log("Failed password attempt by ", socket)
            say('Incorrect password.\r\n');
            passwordAttempts[name]++;
            return repeat();
          }
          return next(socket, 'chooseChar', name);
        });
        break;

      case 'chooseChar':

      /*
      Player selection menu:
        * Can select existing player
        * Can view deceased (if applicable)
        * Can create new (if less than 3 living chars)
      */

        say('Choose your fate:\r\n');
        name = name || dontwelcome;

        const accountAlreadyLoaded = accounts.getAccount(name);
        const multiplaying = player => player.getAccountName() === name;
        const bootPlayer   = player => {
          player.say("Replaced.");
          player.emit('quit');
          util.log("Replaced: ", player.getName());
          players.removePlayer(player, true);
        };

        if (accountAlreadyLoaded) {
          players.eachIf(multiplaying, bootPlayer);
          account = accountAlreadyLoaded;
          account.updateScore();
          account.save();
        } else {
          account = new Account();
          account.load(Data.loadAccount(name));
          accounts.addAccount(account);
        }

        // This just gets their names.
        const characters = account.getCharacters();
        const deceased   = account.getDeceased();

        const maxCharacters   = 3;
        const canAddCharacter = characters.length < maxCharacters;

        let options  = [];
        let selected = '';

        // Configure account options menu
        if (canAddCharacter) {
          options.push({
            display: 'Create New Character',
            onSelect: () => socket.emit('createPlayer', socket, null, account),
          });
        }

        if (characters.length) {
          characters.forEach(char => {
            options.push({
              display: 'Enter World as ' + char,
              onSelect: () => next(socket, 'done', null, char),
            });
          });
        }

        if (deceased.length) {
          options.push({
            display: 'View Memorials',
            onSelect: () => socket.emit('deceased', socket, null, account),
          });
        }

        options.push({
          display: 'Quit',
          onSelect: () => socket.end(),
        });

        // Display options menu

        options.forEach((opt, i) => {
          const num = i + 1;
          say('<cyan>[' + num + ']</cyan> <bold>' + opt.display + '</bold>\r');
        });

        socket.once('data', choice => {
          choice = choice
            .toString()
            .trim();
          choice = parseInt(choice, 10) - 1;
          if (isNaN(choice)) {
            return repeat();
          }

          const selection = options[choice];

          if (selection) {
            util.log('Selected ' + selection.display);
            selection.onSelect();
          } else {
            return repeat();
          }

        });


      break;

      //TODO: Refactor?
      //TODO: Put this in its own emitter or extract into method or something?
      case 'done':

        player = new Player(socket);
        player.load(Data.loadPlayer(name));

        players.addPlayer(player);

        player.getSocket()
          .on('close', () => {
            player.setTraining('beginTraining', Date.now());

            if (!player.isInCombat()) {
              util.log(player.getName() + ' has gone linkdead.');
              player.save(() => players.removePlayer(player, true));
            } else {
              util.log(player.getName() + ' socket closed during combat!!!');
            }

            players.removePlayer(player);
          });

        // Load the player's inventory (There's probably a better place to do this)
        const inv = player.getInventory()
          .map(itemConfig => {
            const item = new Item(itemConfig);
            items.addItem(item);
            return item;
          });
        player.setInventory(inv);

        Commands.player_commands.look(null, player);
        player.checkTraining();

        // All that shit done, let them play!
        player.getSocket()
              .emit("commands", player);

        break;
    }
  };
}
