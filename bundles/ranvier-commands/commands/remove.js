'use strict';

module.exports = (srcPath, bundlePath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Parser = require(srcPath + 'CommandParser').CommandParser;
  const ItemUtil = require(bundlePath + 'ranvier-lib/lib/ItemUtil');

  return {
    aliases: [ 'unwield', 'unequip' ],
    usage: 'remove <item>',
    command : state => (arg, player) => {
      if (!arg.length) {
        return Broadcast.sayAt(player, 'Remove what?');
      }

      const result =  Parser.parseDot(arg, player.equipment, true);
      if (!result) {
        return Broadcast.sayAt(player, "You aren't wearing anything like that.");
      }

      const [slot, item] = result;
      Broadcast.sayAt(player, `<green>You un-equip: </green>${ItemUtil.display(item)}<green>.</green>`);
      player.unequip(slot);
    }
  };
};
