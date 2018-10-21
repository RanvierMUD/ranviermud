'use strict';

const Ranvier = require('ranvier');
const { Broadcast, ItemType } = Ranvier;
const { CommandParser } = Ranvier.CommandParser;
const ItemUtil = require('../../ranvier-lib/lib/ItemUtil');

module.exports = {
  aliases: [ 'unwield', 'unequip' ],
  usage: 'remove <item>',
  command : state => (arg, player) => {
    if (!arg.length) {
      return Broadcast.sayAt(player, 'Remove what?');
    }

    const result = CommandParser.parseDot(arg, player.equipment, true);
    if (!result) {
      return Broadcast.sayAt(player, "You aren't wearing anything like that.");
    }

    const [slot, item] = result;
    Broadcast.sayAt(player, `<green>You un-equip: </green>${ItemUtil.display(item)}<green>.</green>`);
    player.unequip(slot);
  }
};
