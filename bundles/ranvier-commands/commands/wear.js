'use strict';

module.exports = (srcPath, bundlePath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const { CommandParser: Parser } = require(srcPath + 'CommandParser');
  const { EquipSlotTakenError } = require(srcPath + 'EquipErrors');
  const ItemUtil = require(bundlePath + 'ranvier-lib/lib/ItemUtil');
  const Logger = require(srcPath + 'Logger');
  const say = Broadcast.sayAt;

  return {
    aliases: [ 'wield' ],
    usage: 'wear <item>',
    command : (state) => (arg, player) => {
      arg = arg.trim();

      if (!arg.length) {
        return say(player, 'Надеть что?');
      }

      const item = Parser.parseDot(arg, player.inventory);

      if (!item) {
        return say(player, "У вас нет ничего такого.");
      }

      if (!item.metadata.slot) {
        return say(player, `Вы не можете надеть ${ItemUtil.display(item)}.`);
      }

      if (item.level > player.level) {
        return say(player, "Вы пока не можете это использовать.");
      }

      try {
        player.equip(item, item.metadata.slot);
      } catch (err) {
        if (err instanceof EquipSlotTakenError) {
          const conflict = player.equipment.get(item.metadata.slot);
          return say(player, `Сначала вам надо убрать ${ItemUtil.display(conflict)}.`);
        }

        return Logger.error(err);
      }

      say(player, `<green>Вы надели:</green> ${ItemUtil.display(item)}<green>.</green>`);
    }
  };
};
