'use strict';

module.exports = (srcPath, bundlePath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Parser = require(srcPath + 'CommandParser').CommandParser;
  const ItemUtil = require(bundlePath + 'ranvier-lib/lib/ItemUtil');

  return {
    aliases: [ 'unwield', 'unequip', 'снять', 'убрать' ],
    usage: 'снять <предмет>',
    command : state => (arg, player) => {
      if (!arg.length) {
        return Broadcast.sayAt(player, 'Убрать что?');
      }

      const result =  Parser.parseDot(arg, player.equipment, true);
      if (!result) {
        return Broadcast.sayAt(player, "Вы ничего такого не носите.");
      }

      const [slot, item] = result;
      Broadcast.sayAt(player, `<green>Вы сняли: </green>${ItemUtil.display(item)}<green>.</green>`);
      player.unequip(slot);
    }
  };
};
