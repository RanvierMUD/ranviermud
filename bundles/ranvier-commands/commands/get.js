'use strict';

module.exports = (srcPath, bundlePath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Parser = require(srcPath + 'CommandParser').CommandParser;
  const ItemType = require(srcPath + 'ItemType');
  const ItemUtil = require(bundlePath + 'ranvier-lib/lib/ItemUtil');

  return {
    usage: 'взять <имя предмета> [контейнер]',
    aliases: [ 'взять', 'подобрать', 'поднять' ],
    command : (state) => (args, player, arg0) => {
      if (!args.length) {
        return Broadcast.sayAt(player, 'Взять что?');
      }

      if (!player.room) {
        return Broadcast.sayAt(player, 'Вы НИГДЕ, вам нечего здесь взять.');
      }

      if (player.isInventoryFull()) {
        return Broadcast.sayAt(player, "Вы не утащите больше предметов.");
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
          return Broadcast.sayAt(player, "Вы не видите здесь ничего похожего.");
        }

        if (container.type !== ItemType.CONTAINER) {
          return Broadcast.sayAt(player, `${ItemUtil.display(container)} не является контейнером.`);
        }

        if (container.closed) {
          return Broadcast.sayAt(player, `${ItemUtil.display(container)} закрыт.`);
        }

        search = parts[0];
        source = container.inventory;
      }

      if (search === 'all') {
        if (!source || ![...source].length) {
          return Broadcast.sayAt(player, "Здесь нечего брать.");
        }

        for (let item of source) {
          // account for Set vs Map source
          if (Array.isArray(item)) {
            item = item[1];
          }

          if (player.isInventoryFull()) {
            return Broadcast.sayAt(player, "Вы не сможете больше унести.");
          }

          pickup(item, container, player);
        }

        return;
      }

      const item = Parser.parseDot(search, source);
      if (!item) {
        return Broadcast.sayAt(player, "Вы не видите здесь ничего похожего.");
      }

      pickup(item, container, player);
    }
  };


  function pickup(item, container, player) {
    if (item.metadata.noPickup) {
      return Broadcast.sayAt(player, `${ItemUtil.display(item)} не может быть поднят.`);
    }

    if (container) {
      container.removeItem(item);
    } else {
      player.room.removeItem(item);
    }
    player.addItem(item);

    Broadcast.sayAt(player, `<green>Вы получили вещи: </green>${ItemUtil.display(item)}<green>.</green>`);

    item.emit('get', player);
    player.emit('get', item);
  }
};
