'use strict';
const sprintf = require('sprintf').sprintf;
const LevelUtil = require('../src/levels').LevelUtil;
const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {
    const playerExp = player.getAttribute('experience');
    const tolevel = LevelUtil.expToLevel(player.getAttribute('level'));
    const percentage = parseInt((playerExp / tolevel) * 100, 10);
    const color = 'blue';

    let msg = '...';

    util.log(player.getName() + ' experience: ' + playerExp + ' To Level: ', tolevel, ' ');
    util.log('%' + percentage + ' tnl.');

    const toLevelStatus = {
      0: 'You have recently advanced.',
      10: 'You have a lengthy journey ahead before advancing.',
      35: 'You feel that you have more to learn before advancing.',
      66: 'You have learned much since you last advanced.',
      90: 'You are on the cusp of a breakthrough...'
    };

    for (let tier in toLevelStatus) {
      if (percentage >= parseInt(tier, 10)) {
        msg = '<' + color + '>' + toLevelStatus[tier] +
          '</' + color + '>';
      }
    }

    player.say(msg);
  };
};
