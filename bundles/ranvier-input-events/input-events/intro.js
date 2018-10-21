'use strict';

const { Data, EventUtil } = require('ranvier');

/**
 * MOTD event
 */
module.exports = {
  event: state => socket => {
    const motd = Data.loadMotd();
    if (motd) {
      EventUtil.genSay(socket)(motd);
    }

    return socket.emit('login', socket);
  }
};
