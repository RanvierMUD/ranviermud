'use strict';

const WebSocket = require('ws');

module.exports = srcPath => {
  return {
    listeners: {
      startup: state => function (commander) {
        const wss = new WebSocket.Server({ port: commander.port });

        wss.on('connection', function connection(ws) {
          ws.on('message', function incoming(message) {
            console.log('received: %s', message);
            ws.send(message);
          });

          ws.send('Connected!');
        });
      },

      shutdown: state => function () {
      },
    }
  };
};
