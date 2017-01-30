'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const util = require('util');

  return  {
    listeners: {
      /**
       * Effect ticks are every second
       */
      effectTick: state => function () {
        // TODO: Process events
      },
    }
  };
}
