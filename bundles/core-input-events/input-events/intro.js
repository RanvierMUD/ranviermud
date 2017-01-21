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

      return socket.emit('login', socket);
    }
  };
};
