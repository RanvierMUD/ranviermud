'use strict';

const { Broadcast } = require('ranvier');
const LevelUtil = require('../../ranvier-lib/lib/LevelUtil');

module.exports = {
  aliases: [ 'level', 'experience' ],
  usage: 'tnl',
  command: state => (args, player) => {
    const totalTnl = LevelUtil.expToLevel(player.level + 1);
    const currentPerc = player.experience ? Math.floor((player.experience / totalTnl) * 100) : 0;

    Broadcast.sayAt(player, `Level: ${player.level}`);
    Broadcast.sayAt(player, Broadcast.progress(80, currentPerc, "blue"));
    Broadcast.sayAt(player, `${player.experience}/${totalTnl} (${currentPerc}%, ${totalTnl - player.experience} til next level)`);
  }
};
