'use strict';
const sprintf = require('sprintf').sprintf;
const LevelUtil = require('../src/levels').LevelUtil;

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {
    const player_exp = player.getAttribute('experience');
    const tolevel = LevelUtil.expToLevel(player.getAttribute('level'));
    const percentage = (player_exp / tolevel) * 100;
    const color = 'blue';
    let msg = '...';

    //FIXME: What? 101% of to next level is possible?
    const toLevelStatus = {
      10: 'You have far to go before advancing again.',
      25: 'You have a journey ahead before advancing.',
      50: 'You feel that you have more to learn before advancing.',
      75: 'You have learned much since you last advanced.',
      101: 'You are on the cusp of a breakthrough...'
    };

    for (let tier in toLevelStatus) {
      if (percentage <= parseInt(tier)) {
        msg = '<' + color + '>' + toLevelStatus[tier] +
          '.</' + color + '>';
      }
    }

    player.say(msg);
  };
};
