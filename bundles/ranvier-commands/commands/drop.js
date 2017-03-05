'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Parser = require(srcPath + 'CommandParser').CommandParser;

  return {
    usage: 'drop <item>',
    command : (state) => (args, player) => {
      args = args.trim();

      if (!args.length) {
        return Broadcast.sayAt(player, 'Drop what?');
      }

      if (!player.room) {
        return Broadcast.sayAt(player, 'You are floating in the nether, it would disappear forever.');
      }

      const item = Parser.parseDot(args, player.inventory);

      if (!item) {
        return Broadcast.sayAt(player, "You aren't carrying anything like that.");
      }

      player.removeItem(item);
      player.room.addItem(item);
      player.emit('drop', item);
      item.emit('drop', player);

      for (const npc of player.room.npcs) {
        npc.emit('playerDropItem', player, item);
      }

      Broadcast.sayAt(player, `<green>You dropped: </green>${item.display}<green>.</green>`);
    }
  };
};

