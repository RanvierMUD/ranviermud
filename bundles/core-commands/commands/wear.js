'use strict';
const util  = require('util');

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Parser = require(srcPath + 'CommandParser').CommandParser;
  const EquipSlotTakenError = require(srcPath + 'EquipErrors').EquipSlotTakenError;

  return {
    aliases: [ 'wield' ],
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
        return Broadcast.sayAt(player, `You can't wear ${item.name}.`);
      }

      try {
        player.equip(item);
      } catch (err) {
        if (err instanceof EquipSlotTakenError) {
          const conflict = player.equipment.get(item.slot);
          return Broadcast.sayAt(player, `You will have to remove ${conflict.name} first.`);
        }

        return util.log(err);
      }

      Broadcast.sayAt(player, `Equipped: ${item.name}`);
      item.emit('equip', player);
    }
  };
};
