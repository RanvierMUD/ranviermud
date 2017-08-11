'use strict';

module.exports = srcPath => {
  const Telnet = require(srcPath + 'Telnet');
  const Data = require(srcPath + 'Data');
  const Logger = require(srcPath + 'Logger');

  return {
    listeners: {
      startup: state => function (commander) {
        /**
        * Effectively the 'main' game loop but not really because it's a REPL
        */
        let server = new Telnet.TelnetServer({}, socket => {
          const banned = Data.parseFile(srcPath + '/../data/banned.json');
          if (banned.includes(socket.address().address)) {
            return socket.destroy();
          }

          socket.on('interrupt', () => {
            socket.write("\n*interrupt*\n");
          });

          socket.on('error', Logger.error);

          // Register all of the input events (login, etc.)
          state.InputEventManager.attach(socket);

          socket.write("Connecting...\n");
          Logger.log("User connected...");

          // @see: bundles/ranvier-events/events/login.js
          socket.emit('intro', socket);
        }).netServer;

        // Start the server and setup error handlers.
        server.listen(commander.port).on('error', err => {
          if (err.code === 'EADDRINUSE') {
            Logger.error(`Cannot start server on port ${commander.port}, address is already in use.`);
            Logger.error("Do you have a MUD server already running?");
          } else if (err.code === 'EACCES') {
            Logger.error(`Cannot start server on port ${commander.port}: permission denied.`);
            Logger.error("Are you trying to start it on a priviledged port without being root?");
          } else {
            Logger.error("Failed to start MUD server:");
            Logger.error(err);
          }
          process.exit(1);
        });
      },

      shutdown: state => function () {
      },
    }
  };
};
