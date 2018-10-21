'use strict';

// import 3rd party websocket library
const WebSocket = require('ws');

const { Logger } = require('ranvier');

// import our adapter
const WebsocketStream = require('../lib/WebsocketStream');

module.exports = {
  listeners: {
    startup: state => function (commander) {
      // create a new websocket server using the port command line argument
      const wss = new WebSocket.Server({ port: 4001 });

      // This creates a super basic "echo" websocket server
      wss.on('connection', function connection(ws) {

        // create our adapter
        const stream = new WebsocketStream();
        // and attach the raw websocket
        stream.attach(ws);

        // Register all of the input events (login, etc.)
        state.InputEventManager.attach(stream);

        stream.write("Connecting...\n");
        Logger.log("User connected via websocket...");

        // @see: bundles/ranvier-events/events/login.js
        stream.emit('intro', stream);
      });
      Logger.log(`Websocket server started on port: ${wss.options.port}...`);
    },

    shutdown: state => function () {
      // no need to do anything special in shutdown
    },
  }
};
