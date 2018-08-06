'use strict';

module.exports = (srcPath, bundlePath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Parser = require(srcPath + 'CommandParser').CommandParser;
  const ItemUtil = require(bundlePath + 'ranvier-lib/lib/ItemUtil');

  return {
    usage: 'drop <item>',
    command : (state) => (args, player) => {
      args = args.trim();

      if (!args.length) {
        return Broadcast.sayAt(player, 'Бросить что?');
      }

      if (!player.room) {
        return Broadcast.sayAt(player, 'Вы парите в НИГДЕ, вы не можете ничего никуда выбросить.');
      }

      const item = Parser.parseDot(args, player.inventory);

      if (!item) {
        return Broadcast.sayAt(player, "Вы ничего такого при себе не имеете.");
      }

      player.removeItem(item);
      player.room.addItem(item);
      player.emit('drop', item);
      item.emit('drop', player);

      for (const npc of player.room.npcs) {
        npc.emit('playerDropItem', player, item);
      }

      Broadcast.sayAt(player, `<green>Вы выкиули: </green>${ItemUtil.display(item)}<green>.</green>`);
    }
  };
};

