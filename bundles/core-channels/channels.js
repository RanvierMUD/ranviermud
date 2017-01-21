'use strict';

module.exports = (srcPath) => {
  const AudienceWorld = require(srcPath + 'ChannelAudience/World');
  const AudienceArea = require(srcPath + 'ChannelAudience/Area');
  const AudienceRoom = require(srcPath + 'ChannelAudience/Room');
  const AudiencePrivate = require(srcPath + 'ChannelAudience/Private');
  const Channel = require(srcPath + 'Channel');

  return [
    new Channel({
      name: 'chat',
      color: ['bold', 'green'],
      description: 'Chat with everyone on the game',
      audience: new AudienceWorld()
    }),

    new Channel({
      name: 'say',
      color: ['cyan'],
      description: 'Send a message to all players in your room',
      audience: new AudienceRoom(),
      formatter: {
        sender: function (sender, target, message, colorify) {
          return colorify(`You say, '${message}'`);
        },

        target: function (sender, target, message, colorify) {
          return colorify(`${sender.name} says, '${message}'`);
        }
      }
    }),

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
          return colorify(`Someone yell's from nearby, '${message}'`);
        }
      }
    }),
  ];
};
