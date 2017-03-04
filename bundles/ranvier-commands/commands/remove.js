'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Parser = require(srcPath + 'CommandParser').CommandParser;

  return {
    aliases: [ 'unwield', 'unequip' ],
    usage: 'remove <item>',
    command : state => (arg, player) => {
      if (!arg.length) {
        return Broadcast.sayAt(player, 'Remove what?');
      }

      const [slot, item] = Parser.parseDot(arg, player.equipment, true);

      if (!item) {
        return Broadcast.sayAt(player, "You aren't wearing anything like that.");
      }

      player.unequip(slot);

      Broadcast.sayAt(player, `<green>You un-equip: </green>${item.display}<green>.</green>`);
      item.emit('unequip', player);
    }
  };
};
