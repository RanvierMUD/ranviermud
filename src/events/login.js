const EventUtil   = require('../events').EventUtil;
const Data        = require('../data').Data;
const CommandUtil = require('../command_util').CommandUtil;
const Player      = require('../player').Player;


exports.event = (/* globals go here */) => {

  return function login(socket, stage, dontwelcome, name) {

    util.log("Login event detected... ", stage);

    // dontwelcome is used to swallow telnet bullshit
    dontwelcome = typeof dontwelcome == -'undefined' ? false :
      dontwelcome;
    stage = stage || 'intro';

    if (CommandUtil.is(Player, socket)) {
      l10n.setLocale('en');
    }

    var next   = EventUtils.gen_next('login');
    var repeat = EventUtils.gen_repeat(arguments, next);

    switch (stage) {

      case 'intro':
        var motd = Data.loadMotd();
        if (motd) { socket.write(motd); }
        next(socket, 'login');
        break;

      case 'login':
        if (!dontwelcome) {
          socket.write("Welcome, what is your name? ");
        }

        //      If account, continue to player selection menu
        //      Else, continue to account creation menu

        socket.once('data', function (name) {

          if (!EventUtil.isNegot(name)) {
            next(socket, 'login', true);
            return;
          }

          var name = name
            .toString()
            .trim();

          //TODO: Blacklist/whitelist names here.
          if (/[^a-z]/i.test(name) || !name) {
            socket.write("That's not really your name, now is it?\r\n");
            return repeat();
          }


          name = EventUtil.capitalize(name);

          var data = Data.loadAccount(name);

          // That player doesn't exist so ask if them to create it
          if (!data) {
            util.log('No account found')
            return socket.emit('createAccount', socket, 'check', name);
          }

          return next(socket, 'password', false, name);

        });
        break;

      case 'password':

        util.log('Password...');

        if (!password_attempts[name]) {
          password_attempts[name] = 0;
        }

        // Boot and log any failed password attempts
        if (password_attempts[name] > 2) {
          socket.write("Password attempts exceeded.\r\n");
          password_attempts[name] = 0;
          util.log('Failed login - exceeded password attempts - ' + name);
          socket.end();
          return false;
        }

        util.log('dontwelcome: ', dontwelcome);
        if (!dontwelcome) {
          socket.write("Enter your password: ");
        }

        socket.once('data', pass => {
          // Skip garbage
          if (pass[0] === 0xFA) {
            return next(socket, 'password', true, name);
          }

          pass = crypto
            .createHash('md5')
            .update(pass.toString('').trim())
            .digest('hex');

          if (pass !== Data.loadAccount(name).password) {
            util.log("Failed password attempt by ", socket)
            socket.write(L('PASSWORD_FAIL') + "\r\n");
            password_attempts[name] += 1;
            return repeat();
          }
          next(socket, 'chooseChar', name);
        });
        break;

      // Player selection menu:
      // * Can select existing player
      // * Can view deceased (if applicable)
      // * Can create new (if less than 3 living chars)

      //TODO: Redo 'done' below this
      //TODO: Consider turning into its own event listener.
      case 'chooseChar':

        socket.write('Choose your fate:\r\n');
        name = name || dontwelcome;

        const boot = accounts.getAccount(name);

        const multiplaying = player => {
          const accountName = player.getAccountName().toLowerCase();
          util.log('checking', accountName);
          util.log('against', name);
          return accountName === name.toLowerCase();
        };

        //TODO: Consider booting later, when player enters.
        if (boot) {
          players.eachIf(
            multiplaying,
            p => {
              p.say("Replaced.");
              p.emit('quit');
              util.log("Replaced: ", p.getName());
              players.removePlayer(p, true);
            });
          account = boot;
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
          say('<cyan>[' + num + ']</cyan> <bold>' + opt.display + '</bold>\r\n');
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

            //TODO: Consider saving player here as well, and stuff.
            players.removePlayer(player);
          });

        players.broadcastL10n(l10n, 'WELCOME_BACK', player.getName());

        //TODO: Have load in player file?
        // Load the player's inventory (There's probably a better place to do this)
        var inv = [];
        player.getInventory()
          .forEach(item => {
            item = new Item(item);
            items.addItem(item);
            inv.push(item);
          });
        player.setInventory(inv);

        Commands.player_commands.look(null, player);
        player.checkTraining();

        // All that shit done, let them play!
        player.getSocket().emit("commands", player);

        break;
    }
  };
}
