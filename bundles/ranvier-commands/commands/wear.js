'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const { CommandParser: Parser } = require(srcPath + 'CommandParser');
  const { EquipSlotTakenError } = require(srcPath + 'EquipErrors');
  const Logger = require(srcPath + 'Logger');
  const say = Broadcast.sayAt;

  return {
    aliases: [ 'wield' ],
    usage: 'wear <item>',
    command : (state) => (arg, player) => {
      arg = arg.trim();

      if (!arg.length) {
        return say(player, 'Wear what?');
      }

      const item = Parser.parseDot(arg, player.inventory);

      if (!item) {
        return say(player, "You aren't carrying anything like that.");
      }

      if (!item.slot) {
        return say(player, `You can't wear ${item.display}.`);
      }

      if (item.level > player.level) {
        return say(player, "You can't use that yet.");
      }

      try {
        player.equip(item);
      } catch (err) {
        if (err instanceof EquipSlotTakenError) {
          const conflict = player.equipment.get(item.slot);
          return say(player, `You will have to remove ${conflict.display} first.`);
        }

        return Logger.error(err);
      }

      say(player, `<green>You equip:</green> ${item.display}<green>.</green>`);
      item.emit('equip', player);
      player.emit('equip', item.slot, item);

      if (item.properties && item.properties.stats) {
        player.addEffect(createAttributeEffect(state, player, item.slot, item.properties.stats));
      }
    }
  };
};

/**
 * Uses effect from ranvier-effects/effects/equip.js
 */
function createAttributeEffect(state, player, slot, stats) {
  const config = {
    name: 'Equip: ' + slot,
    type: 'equip.' + slot
  };

  const effectState = {
    slot,
    stats,
  };

  return state.EffectFactory.create(
    'equip',
    player,
    config,
    effectState
  );
}
