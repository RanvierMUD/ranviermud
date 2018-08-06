'use strict';

module.exports = (srcPath, bundlePath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const ItemUtil = require(bundlePath + 'ranvier-lib/lib/ItemUtil');

  return {
    aliases: ['worn', 'экипировка'],
    usage: 'экипировка',
    command: (state) => (args, player) => {
      if (!player.equipment.size) {
        return Broadcast.sayAt(player, "Вы абсолютно голый!");
      }

      Broadcast.sayAt(player, "Надето на данный момент:");
      for (const [slot, item] of player.equipment) {
        Broadcast.sayAt(player, `  <${slot}> ${ItemUtil.display(item)}`);
      }
    }
  };
};
