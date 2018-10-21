Channels are any mode of communication between players in the game. This guide will go over creating 4 different
channels with different audiences as an example of how you may want to implement your own: say, yell, tell, and chat.

[TOC]

## channels.js

The first step to adding channels is to create the `channels.js` file in your bundle.

```
bundles/my-bundle/
  channels.js
```

Almost identical to all other bundle loaded `.js` files, channels.js instead returns an array of channels. The examples
below show only one channel per file but you can absolutely have multiple channels, hence returning an array.

```javascript
'use strict';

const { Channel } = require('ranvier');

module.exports = [ ];
```

## Example channels

### chat

This `chat` channel is an example of a game-wide communication channel. All players in the game see it.

```javascript
'use strict';

const { WorldAudience, Channel, PlayerRoles } = require('ranvier');

module.exports = [
  new Channel({
    // the name of the channel is the command the player will use
    name: 'chat',

    // Aliases for the channel, in this example, if your command is ". Hello" is equivalent to "chat Hello"
    aliases: ['.'],

    // Information about this channel shown when player types channel name without a message
    description: 'Chat with everyone on the game',

    /*
    optional color of output from his channel.
    Available colors are: black, red, green, yellow, blue, magenta, cyan, and white.
    Additionally you can specify 'bold' as a color to make the text bold. e.g., color: ['bold', 'red'],
    */
    color: ['bold', 'green'],

    /*
    `audience` defines who will receive the message from this channel.
    */
    audience: new WorldAudience(),

    /*
    Optionally you can specify a minimum player role required to use the channel
    Note: This property is not used by the core to perform any restrictions, it is simply added as a
    public property to allow bundles to access it and do their own restriction.

    minRequiredRole: PlayerRoles.ADMIN,
    */
  }),
];
```

### say

`say` is a common MUD channel which communicates a message to other players in the same room as the player.

```javascript
'use strict';

const { Channel, RoomAudience } = require('ranvier');

module.exports = [
  new Channel({
    name: 'say',
    color: ['cyan'],
    description: 'Send a message to all players in your room',
    audience: new AudienceRoom(),

    /*
    formatter allows you to customize how message from this channel appear to the sender and receiver
    `sender` defines how the message appears the sender, and vice versa for target.
    Both functions get the `Player` who sent it, the `Player` receiving the message, the message itself
    and the `colorify` function to apply the channel's color to the message.
    */
    formatter: {
      sender: function (sender, target, message, colorify) {
        return colorify(`You say, '${message}'`);
      },

      target: function (sender, target, message, colorify) {
        return colorify(`${sender.name} says, '${message}'`);
      }
    }
  }),
];
```

### tell

`tell` is an example of a private channel. The message is only shown to the sender and target.

```javascript
'use strict';

const { Channel, RoomAudience } = require('ranvier');

module.exports = [
  new Channel({
    name: 'tell',
    color: ['bold', 'cyan'],
    description: 'Send a private message to another player',
    audience: new AudiencePrivate(),
    formatter: {
      sender: function (sender, target, message, colorify) {
        return colorify(`You tell ${target.name}, '${message}'`);
      },

      target: function (sender, target, message, colorify) {
        return colorify(`${sender.name} tells you, '${message}'`);
      }
    }
  }),
];
```

### yell

`yell` is an example channel that sends a message only to players in the same area as the sender.

```javascript
'use strict';

const { Channel, AreaAudience } = require('ranvier');

module.exports = [
  new Channel({
    name: 'yell',
    color: ['bold', 'red'],
    description: 'Send a message to everyone in your area',
    audience: new AudienceArea(),
    formatter: {
      sender: function (sender, target, message, colorify) {
        return colorify(`You yell, '${message}'`);
      },

      target: function (sender, target, message, colorify) {
        return colorify(`Someone yells from nearby, '${message}'`);
      }
    }
  }),
];
```
