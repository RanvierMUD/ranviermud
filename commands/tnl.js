var sprintf = require('sprintf').sprintf;
var LevelUtil = require('../src/levels').LevelUtil;
exports.command = function(rooms, items, players, npcs, Commands) {
  return function(args, player) {
    var player_exp = player.getAttribute('experience');
    var tolevel = LevelUtil.expToLevel(player.getAttribute('level'));
    var percentage = (player_exp / tolevel) * 100;
    var color = 'blue';
    var msg = '...';

    var toLevelStatus = {
      10: 'You have far to go before advancing again.',
      25: 'You have a journey ahead before advancing.',
      50: 'You feel that you have more to learn before advancing.',
      75: 'You feel that you have learned much since you last advanced.',
      101: 'You feel you are on the cusp of a breakthrough.'
    };

    for (var tier in toLevelStatus) {
      if (percentage <= parseInt(tier)) {
        msg = '<' + color + '>' + toLevelStatus[tier] +
          '.</' + color + '>';
      }
    }

    player.say(msg);
  };
};