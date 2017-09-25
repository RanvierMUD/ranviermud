'use strict';

module.exports = (srcPath, bundlePath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Parser = require(srcPath + 'CommandParser').CommandParser;
  const ItemType = require(srcPath + 'ItemType');
  const ItemUtil = require(bundlePath + 'ranvier-lib/lib/ItemUtil');

  return {
    usage: 'get <item> [container]',
    aliases: [ 'take', 'pick', 'loot' ],
    command : (state) => (args, player, arg0) => {
      if (!args.length) {
        return Broadcast.sayAt(player, 'Get what?');
      }

      if (!player.room) {
        return Broadcast.sayAt(player, 'You are floating in the nether, there is nothing to get.');
      }

      if (player.isInventoryFull()) {
        return Broadcast.sayAt(player, "You can't hold any more items.");
      }

      // 'loot' is an alias for 'get all'
      if (arg0 === 'loot') {
        args = ('all ' + args).trim();
      }

      // get 3.foo from bar -> get 3.foo bar
      let parts = args.split(' ').filter(arg => !arg.match(/from/));

      // pick up <item>
      if (parts.length > 1 && parts[0] === 'up') {
        parts = parts.slice(1);
      }

      let source = null, search = null, container = null;
      if (parts.length === 1) {
        search = parts[0];
        source = player.room.items;
      } else {
      //Newest containers should go first, so that if you type get all corpse you get from the 
      // most recent corpse. See issue #247.
        container = Parser.parseDot(parts[1], [...player.room.items].reverse());
        if (!container) {
          return Broadcast.sayAt(player, "You don't see anything like that here.");
        }

        if (container.type !== ItemType.CONTAINER) {
          return Broadcast.sayAt(player, `${ItemUtil.display(container)} isn't a container.`);
        }

        if (container.closed) {
          return Broadcast.sayAt(player, `${ItemUtil.display(container)} is closed.`);
        }

        search = parts[0];
        source = container.inventory;
      }

      if (search === 'all') {
        if (!source || ![...source].length) {
          return Broadcast.sayAt(player, "There isn't anything to take.");
        }

        for (let item of source) {
          // account for Set vs Map source
          if (Array.isArray(item)) {
            item = item[1];
          }

          if (player.isInventoryFull()) {
            return Broadcast.sayAt(player, "You can't carry any more.");
          }

          pickup(item, container, player);
        }

        return;
      }

      const item = Parser.parseDot(search, source);
      if (!item) {
        return Broadcast.sayAt(player, "You don't see anything like that here.");
      }

      pickup(item, container, player);
    }
  };


  function pickup(item, container, player) {
    if (item.properties.noPickup) {
      return Broadcast.sayAt(player, `${ItemUtil.display(item)} can't be picked up.`);
    }

    if (container) {
      container.removeItem(item);
    } else {
      player.room.removeItem(item);
    }
    player.addItem(item);

    Broadcast.sayAt(player, `<green>You receive loot: </green>${ItemUtil.display(item)}<green>.</green>`);

    item.emit('get', player);
    player.emit('get', item);
  }
};
