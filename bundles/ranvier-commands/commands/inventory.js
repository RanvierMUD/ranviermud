'use strict';

module.exports = (srcPath, bundlePath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const ItemUtil = require(bundlePath + 'ranvier-lib/lib/ItemUtil');

  return {
    usage: 'инвентарь',
	aliases: ['инвентарь' ],
    command : (state) => (args, player) => {
      if (!player.inventory || !player.inventory.size) {
        return Broadcast.sayAt(player, "У вас ничего нет.");
      }

      Broadcast.at(player, "Ваш инвентарь:");
      if (isFinite(player.inventory.getMax())) {
        Broadcast.at(player, ` (${player.inventory.size}/${player.inventory.getMax()})`);
      }
      Broadcast.sayAt(player, ':');

      // TODO: Implement grouping
      for (const [, item ] of player.inventory) {
        Broadcast.sayAt(player, ItemUtil.display(item));
      }
    }
  };
};
