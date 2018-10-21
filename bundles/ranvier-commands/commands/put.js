'use strict';

const Ranvier = require('ranvier');
const { Broadcast: B, ItemType } = Ranvier;
const { CommandParser } = Ranvier.CommandParser;
const dot = CommandParser.parseDot;
const ItemUtil = require('../../ranvier-lib/lib/ItemUtil');

module.exports = {
  usage: 'put <item> <container>',
  command : (state) => (args, player) => {
    args = args.trim();

    if (!args.length) {
      return B.sayAt(player, 'Put what where?');
    }

    // put 3.foo in bar -> put 3.foo bar -> put 3.foo into bar
    const parts = args.split(' ').filter(arg => !arg.match(/in/) && !arg.match(/into/));

    if (parts.length === 1) {
      return B.sayAt(player, "Where do you want to put it?");
    }

    const fromList = player.inventory;
    const fromArg = parts[0];
    const toArg = parts[1];
    const item = dot(fromArg, fromList);
    const toContainer = dot(toArg, player.room.items) ||
                        dot(toArg, player.inventory) ||
                        dot(toArg, player.equipment);

    if (!item) {
      return B.sayAt(player, "You don't have that item.");
    }

    if (!toContainer) {
      return B.sayAt(player, "You don't see anything like that here.");
    }

    if (toContainer.type !== ItemType.CONTAINER) {
      return B.sayAt(player, `${ItemUtil.display(toContainer)} isn't a container.`);
    }

    if (toContainer.isInventoryFull()) {
      return B.sayAt(player, `${ItemUtil.display(toContainer)} can't hold any more.`);
    }

    if (toContainer.closed) {
      return B.sayAt(player, `${ItemUtil.display(toContainer)} is closed.`);
    }

    player.removeItem(item);
    toContainer.addItem(item);

    B.sayAt(player, `<green>You put </green>${ItemUtil.display(item)}<green> into </green>${ItemUtil.display(toContainer)}<green>.</green>`);

    item.emit('put', player, toContainer);
    player.emit('put', item, toContainer);
  }
};
