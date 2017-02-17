'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const LevelUtil = require(srcPath + 'LevelUtil');

  return {
    aliases: [ 'level', 'experience' ],
    usage: 'tnl',
    command: state => (args, player) => {
      const totalTnl = LevelUtil.expToLevel(player.level + 1);
      const currentPerc = player.experience ? Math.floor((player.experience / totalTnl) * 100) : 0;

      Broadcast.sayAt(player, Broadcast.progress(80, currentPerc, "blue"));
      Broadcast.sayAt(player, `Level: ${player.level}`);
      Broadcast.sayAt(player, `${player.experience}/${totalTnl} (${currentPerc}%, ${totalTnl - player.experience} til next level)`);
    }
  };
};
