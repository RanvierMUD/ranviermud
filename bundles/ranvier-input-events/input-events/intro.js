'use strict';

/**
 * MOTD event
 */
module.exports = (srcPath) => {
  const Data = require(srcPath + 'Data');
  const EventUtil = require(srcPath + 'EventUtil');

  return {
    event: state => socket => {
      const motd = Data.loadMotd();
      if (motd) {
        EventUtil.genSay(socket)(motd);
      }

      socket.command('sendAudio', 'menu_music', {
        looping: true,
        background: true
      });

      return socket.emit('login', socket);
    }
  };
};
