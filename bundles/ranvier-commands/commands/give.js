'use strict';

module.exports = (srcPath, bundlePath) => {
  const B = require(srcPath + 'Broadcast');
  const { CommandParser } = require(srcPath + 'CommandParser');
  const dot = CommandParser.parseDot;
  const ItemUtil = require(bundlePath + 'ranvier-lib/lib/ItemUtil');

  return {
    usage: 'дать <предмет> <цель>',
	aliases: ['дать' ],
    command: state => (args, player) => {
      if (!args || !args.length) {
        return B.sayAt(player, 'Дать что и кому?');
      }

      let [ targetItem, to, targetRecip ] = args.split(' ');
      // give foo to bar
      if (to !== 'to' || !targetRecip) {
        targetRecip = to;
      }

      if (!targetRecip) {
        return B.sayAt(player, 'Кому вы хотите это дать??');
      }

      targetItem = dot(targetItem, player.inventory);

      if (!targetItem) {
        return B.sayAt(player, 'У вас этого нет.');
      }

      // prioritize players before npcs
      let target = dot(targetRecip, player.room.players);

      if (!target) {
        target = dot(targetRecip, player.room.npcs);
        if (target) {
          const accepts = target.getBehavior('accepts');
          if (!accepts || !accepts.includes(targetItem.entityReference)) {
            return B.sayAt(player, 'Ему это не надо.');
          }
        } 
      }

      if (!target) {
        return B.sayAt(player, 'Он, кажется, не здесь.');
      }

      if (target === player) {
        return B.sayAt(player, `<green>Вы переместили ${ItemUtil.display(targetItem)} из одной руки в другую. Это было продуктивно.</green>`);
      }

      if (target.isInventoryFull()) {
        return B.sayAt(player, 'Он не может больше нести.');
      }

      player.removeItem(targetItem);
      target.addItem(targetItem);

      B.sayAt(player, `<green>Вы дали <white>${target.name}</white>: ${ItemUtil.display(targetItem)}.</green>`);
      if (!target.isNpc) {
        B.sayAt(target, `<green>${player.name} дал вам: ${ItemUtil.display(targetItem)}.</green>`);
      }
    }
  };
};
