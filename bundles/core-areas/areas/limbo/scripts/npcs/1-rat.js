'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const util = require('util');

  return  {
    listeners: {
      spawn: state => function () {
        Broadcast.sayAt(this.room, "A rat scurries into view.");
      },
    }
  };
}
