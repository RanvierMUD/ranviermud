'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const { CommandParser: Parser } = require(srcPath + 'CommandParser');
  const { EquipSlotTakenError } = require(srcPath + 'EquipErrors');
  const Logger = require(srcPath + 'Logger');

  return {
    aliases: [ 'wield' ],
    usage: 'wear <item>',
    command : (state) => (arg, player) => {
      arg = arg.trim();

      if (!arg.length) {
        return Broadcast.sayAt(player, 'Wear what?');
      }

      const item = Parser.parseDot(arg, player.inventory);

      if (!item) {
        return Broadcast.sayAt(player, "You aren't carrying anything like that.");
      }

      if (!item.slot) {
        return Broadcast.sayAt(player, `You can't wear ${item.display}.`);
      }

      try {
        player.equip(item);
      } catch (err) {
        if (err instanceof EquipSlotTakenError) {
          const conflict = player.equipment.get(item.slot);
          return Broadcast.sayAt(player, `You will have to remove ${conflict.display} first.`);
        }

        return Logger.error(err);
      }

      Broadcast.sayAt(player, `<green>You equip:</green> ${item.display}<green>.</green>`);
      item.emit('equip', player);
    }
  };
};
