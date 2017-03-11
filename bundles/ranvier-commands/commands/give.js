'use strict';

module.exports = srcPath => {
  const B = require(srcPath + 'Broadcast');
  const { CommandParser } = require(srcPath + 'CommandParser');
  const dot = CommandParser.parseDot;

  return {
    usage: 'give <item> <target>',
    command: state => (args, player) => {
      if (!args || !args.length) {
        return B.sayAt(player, 'Give what to whom?');
      }

      let [ targetItem, to, targetRecip ] = args.split(' ');
      console.log({ targetItem, to, targetRecip });
      // give foo to bar
      if (to !== 'to' || !targetRecip) {
        targetRecip = to;
      }

      if (!targetRecip) {
        return B.sayAt(player, 'Who do you want to give it to?');
      }

      targetItem = dot(targetItem, player.inventory);

      if (!targetItem) {
        return B.sayAt(player, 'You don\'t have that.');
      }

      // prioritize players before npcs
      let target = dot(targetRecip, player.room.players);

      if (!target) {
        target = dot(targetRecip, player.room.npcs);
        if (target) {
          const accepts = target.getBehavior('accepts');
          if (!accepts || !accepts.includes(targetItem.entityReference)) {
            return B.sayAt(player, 'They don\'t want that.');
          }
        } 
      }

      if (!target) {
        return B.sayAt(player, 'They aren\'t here.');
      }

      if (target === player) {
        return B.sayAt(player, `<green>You move ${targetItem.display} from one hand to the other. That was productive.</green>`);
      }

      player.removeItem(targetItem);
      target.addItem(targetItem);

      B.sayAt(player, `<green>You give <white>${target.name}</white>: ${targetItem.display}.</green>`);
      if (!target.isNpc) {
        B.sayAt(target, `<green>${player.name} gives you: ${targetItem.display}.</green>`);
      }
    }
  };
};
