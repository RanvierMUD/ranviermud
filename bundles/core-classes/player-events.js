'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const LevelUtil = require(srcPath + 'LevelUtil');

  return  {
    listeners: {
      /**
       * Handle player leveling up
       * @param {number} amount Exp gained
       */
      level: state => function (amount) {
      }
    }
  };
};
