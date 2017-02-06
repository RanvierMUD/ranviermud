'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const LevelUtil = require(srcPath + 'LevelUtil');

  return {
    aliases: [ 'level', 'experience' ],
    command: state => (args, player) => {
      const totalTnl = LevelUtil.expToLevel(player.level + 1);
      const currentPerc = player.experience ? Math.floor((player.experience / totalTnl) * 100) : 0;

      let buf = '<blue>[<bold>';
      const maxWidth = 77;
      buf += new Array(Math.ceil((currentPerc / 100) * maxWidth)).join('#') + '|';
      buf += new Array(maxWidth - Math.ceil((currentPerc  / 100) * maxWidth)).join(' ');
      buf += '</bold>]</blue>';
      Broadcast.sayAt(player, buf);
      Broadcast.sayAt(player, `Level: ${player.level}`);
      Broadcast.sayAt(player, `${player.experience}/${totalTnl} (${currentPerc}%, ${totalTnl - player.experience} til next level)`);
    }
  };
};
