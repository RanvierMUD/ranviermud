'use strict';

const formatters = {
  narrative: {
    
  }
};

module.exports = (srcPath) => {
  const ChannelAudience = require(srcPath + 'ChannelAudience');
  const Channel = require(srcPath + 'Channel');
  return [
    new Channel({
      name: 'chat',
      color: ['bold', 'green'],
      description: 'Chat with everyone on the game',
      audience: ChannelAudience.WORLD
    }),

    new Channel({
      name: 'say',
      color: ['cyan'],
      description: 'Send a message to all players in your room',
      audience: ChannelAudience.ROOM,
      formatter: {
        sender: function (sender, message, colorify) {
          return colorify(`You say, '${message}'`);
        },

        target: function (target, sender, message, colorify) {
          return colorify(`${sender.name} says, '${message}'`);
        }
      }
    }),

    new Channel({
      name: 'yell',
      color: ['bold', 'red'],
      description: 'Send a message to everyone in your area',
      audience: ChannelAudience.AREA,
      formatter: {
        sender: function (sender, message, colorify) {
          return colorify(`You yell, '${message}'`);
        },

        target: function (target, sender, message, colorify) {
          return colorify(`Someone yell's from nearby, '${message}'`);
        }
      }
    }),
  ];
};
