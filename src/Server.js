'use strict';

// built-ins
const util = require('util');
const commander = require('commander');
const pkg = require('../package.json');

// local
const Telnet = require('./Telnet');
const Config = require('./Config');
const AccountManager = require('./AccountManager');
const AreaManager = require('./AreaManager');
const CommandManager = require('./CommandManager');
const ChannelManager = require('./ChannelManager');
const EventManager = require('./EventManager');
const ItemManager = require('./ItemManager');
const ItemFactory = require('./ItemFactory');
const MobFactory = require('./MobFactory');
const PlayerManager = require('./PlayerManager');
const RoomManager = require('./RoomManager');
const HelpManager = require('./HelpManager');
const Broadcast = require('./Broadcast');

class Server {

    constructor() {
        this.GameState = {};
        this.server;
    }

    init(restartServer) {

        let saveInterval;

        this.loadCommands();

        util.log("START - Loading entities");
        restartServer = typeof restartServer === 'undefined' ? true : restartServer;

        this.GameState = {
            // Stores all logged in accounts
            AccountManager: new AccountManager(),
            // Stores all loaded areas
            AreaManager: new AreaManager(),
            // Stores all loaded commands
            CommandManager: new CommandManager(),
            // Stores all loaded channels
            ChannelManager: new ChannelManager(),
            // Stores all loaded spells, just kidding, it stores events
            InputEventManager: new EventManager(),
            // Helper for creating/cloning items
            ItemFactory: new ItemFactory(),
            // Stores all loaded items
            ItemManager: new ItemManager(),
            // Helper for creating/cloning Npcs (mobs)
            MobFactory: new MobFactory(),
            // Stores all connected players
            PlayerManager: new PlayerManager(),
            // Stores all loaded rooms across all areas ever
            RoomManager: new RoomManager(),
            // Stores all loaded helpfiles
            HelpManager: new HelpManager(),

            // All global server settings like default respawn time, save interval, port, what bundles to load, etc.
            Config: Config,
        };

        // Setup bundlemanager
        const BundleManager = new (require('./BundleManager'))(this.GameState);

        BundleManager.loadBundles();

        if (restartServer) {
            util.log("START - Starting server");

            /**
             * Effectively the 'main' game loop but not really because it's a REPL
             */
            this.server = new Telnet.TelnetServer({}, socket => {
                socket.on('interrupt', () => {
                    socket.write("\n*interrupt*\n");
                });

                socket.on('error', err => util.log(err));

                // Register all of the events
                this.GameState.InputEventManager.attach(socket);

                socket.write("Connecting...\n");
                util.log("User connected...");

                // @see: bundles/core-events/events/login.js
                socket.emit('login', socket);
            }).netServer;

            // start the server
            this.server.listen(commander.port).on('error', err => {
                if (err.code === 'EADDRINUSE') {
                    util.log("Cannot start server on port " + commander.port + ", address is already in use.");
                    util.log("Do you have a MUD server already running?");
                } else if (err.code === 'EACCES') {
                    util.log("Cannot start server on port " + commander.port + ": permission denied.");
                    util.log("Are you trying to start it on a priviledged port without being root?");
                } else {
                    util.log("Failed to start MUD server:");
                    util.log(err);
                }
                process.exit(1);
            });

            // save every 10 minutes
            util.log("Setting autosave to " + commander.save + " seconds.");
            clearInterval(saveInterval);
            saveInterval = setInterval(this.save.bind(this), commander.save * 1000);


            // TODO: RESPAWN
        }

        util.log(util.format("Server started on port: %d %s", commander.port, '...'));
        this.server.emit('startup');
    }

    loadCommands() {
        // cmdline options
        commander
            .version(pkg.version)
            .option('-s, --save [time]', 'Number of seconds between auto-save ticks [10]', 10)
            .option('-r, --respawn [time]', 'Number of minutes between respawn ticks [120]', 120)
            .option('-p, --port [portNumber]', 'Port to host telnet server [23]', 23)
            .option('-v, --verbose', 'Verbose console logging.', true)
            .parse(process.argv);

        process.stdin.setEncoding('utf8');
        process.stdin.resume();
        process.stdin.on('data', data => {
            data = data.trim();
            const command = data.split(' ')[0];
            const args = data.split(' ').slice(1).join(' ');

            switch (command) {
                case "save":
                    this.save(args);
                    break;
                case "reload":
                    this.reload(args);
                    break;
                case "restart":
                    this.restart(args);
                    break;
                case "shutdown":
                    this.shutdown(args);
                    break;
                default:
                    console.log("That's not a real command...");
                    return;
                    break;
            }
        });
    }

    save(callback) {
        this.GameState.PlayerManager.saveAll();
        if (callback) {
            callback();
        }
    }

    reload(args) {
        this.serverOperation('SERVER RELOAD', () => {
            util.log("Reloading...");
            this.save(() => this.init(false));
        }, args);
    }

    restart(args) {
        this.serverOperation('SERVER RESTART', () => {
            util.log("Restarting...");
            this.save();
            this.server.emit('shutdown');
            this.server.close();
            this.init(true);
        }, args);
    }

    shutdown(args) {
        this.serverOperation('SERVER SHUTDOWN', () => {
            util.log("Shutting down...");
            this.save();
            this.server.emit('shutdown');
            this.server.close();
        }, args);
    }

    serverOperation(warningStr, operation, args) {
        args = args ? args.split(' ') : [];
        const shouldWarn = args[0] && args[0] === 'warn';

        let time = args[0] ? parseInt(args[shouldWarn ? 1 : 0], 10) : 0;

        if (time && time < 20) {
            console.log("Gotta give the players a bit longer than that, might as well do it instantly...");
            console.log("Doing nothing.");
            return;
        }

        time = time ? time * 1000 : 0;

        global.countdown = time;

        if (shouldWarn) {
            const warnPlayers = interval => {
                this.GameState.PlayerManager.players.forEach(p => Broadcast.sayAt(p, `${warningStr} ${global.countdown/ 1000} SECONDS`));
                global.countdown -= interval;
            };

            const warningInterval = Math.floor(time / 4);

            warnPlayers(warningInterval);

            setInterval(() => warnPlayers(warningInterval), warningInterval);
        }

        util.log(warningStr + " SERVER" + (time ? " IN " + (time / 1000) + " SECONDS " : ''));
        setTimeout(operation, time);
    }
}

module.exports = Server;