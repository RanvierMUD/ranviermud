## Game Server & Network Layer

Traditionally changing the network layer in MUDs is nigh impossible. But with Ranvier, like everything else, the server
is event based and the core code has no opinions on what network layer is used. Server events also let you bind to the
game's startup and shutdown to do other things: host an API, host a website, whatever you like.

### Folder Structure

```
bundles/my-bundle/
  server-events/
    my-events.js
```

The game server supports two events by default: `startup` and `shutdown`. As such the file structure will be as follows
(similar to all other event scripts):

### File Structure

```javascript
'use strict'

module.exports = {
  listeners: {
    /**
     * The startup event is passed the `commander` variable which lets you access command line arguments used to start
     * the server. As with all entity scripts/commands/etc. you also have access to the entire game state.
     */
    startup: state => function (commander) {
      // startup tasks here
    },

    shutdown: state => function () {
      // shutdown tasks here
    },
  }
};
```

### Example

Ranvier, out of the box, contains a bundle called `ranvier-telnet` which is enabled by default, this sets up Ranvier to
allow telnet based connections. With that in mind let's create our own bundle that will use websockets instead.

> Note: Ranvier comes with a websocket connection bundle but it is now enabled by default, you don't actually have to
> write your own just enable the bundle. However, this example remains for pedagogical purposes.

First our bundle will need a 3rd party library so follow the process described in the [Bundles](bundles.md) guide to
install the `ws` node module.


### The Transport Stream

Next we will have to create a custom `TransportStream` to act as an adapter between the `WebSocket` and Ranvier. To do
this inside your bundle directory create a folder called `lib/` and in that folder let's create a file called
`WebsocketStream.js`

```
bundles/my-bundle/
  lib/
    WebsocketStream.js
```

In this file we will use the `TransportStream` class provided by the core as the base for our adapter.

```javascript
'use strict';

const { TransportStream } = require('ranvier');

/**
 * Essentially we want to look at the methods of WebSocket and match them to the appropriate methods on TransportStream
 */
class WebsocketStream extends TransportStream
{
  attach(socket) {
    super.attach(socket);

    // websocket uses 'message' instead of the 'data' event net.Socket uses
    socket.on('message', message => {
      this.emit('data', message);
    });
  }

  get writable() {
    return this.socket.readyState === 1;
  }

  write(...args) {
    if (!this.writable) {
      return;
    }

    // this.socket will be set when we do `ourWebsocketStream.attach(websocket)`
    this.socket.send(...args);
  }

  pause() {
    this.socket.pause();
  }

  resume() {
    this.socket.resume();
  }

  end() {
    // 1000 = normal close, no error
    this.socket.close(1000);
  }
}

module.exports = WebsocketStream;
```

### Starting the Server

To actually start the server we'll want to create our server event script as described above:

```
bundles/my-bundle/
  server-events/
    websocket-server.js
```

```javascript
'use strict';

// import 3rd party websocket library
const WebSocket = require('ws');

// import core logger
const { Logger } = require('ranvier');

// import our adapter
const WebsocketStream = require('../lib/WebsocketStream');

module.exports = {
  listeners: {
    startup: state => function (commander) {
      // create a new websocket server using the port command line argument
      const wss = new WebSocket.Server({ port: commander.port });

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
    },

    shutdown: state => function () {
      // no need to do anything special in shutdown
    },
  }
};
```

### Enabling our bundle

Finally inside `ranvier.json` in the root of the project replace `ranvier-telnet` with `my-bundle` and Bob's your uncle, as they say.
Completely rewriting the network layer of the game engine in less than 100 lines of code including comments: not bad at all.
