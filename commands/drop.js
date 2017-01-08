'use strict';
const CommandUtil = require('../src/command_util').CommandUtil;
const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player, isDead) => {
    const room = rooms.getAt(player.getLocation());

    //TODO: Does this handle dropping a container with items in it?
    // Should remove all contents from player inventory and set the room for each of them.

    args = args.toLowerCase();

    if (args === 'all') {
      dropAll();
      return;
    }

    let item = CommandUtil.findItemInInventory(args, player, true);

    if (!item) {
      return player.warn('You cannot drop an item you do not have.');
    }

    if (item.isEquipped()) {
      item = CommandUtil.findItemInInventory('2.' + args, player, true) || item;
    }

    drop(item);

    function dropAll() {
      const items = player.getInventory();
      if (!items.length && !isDead) { return player.say('You have nothing to drop.'); }
      items.forEach(item => drop(item));
    }

    function drop(item) {
      let playerName = player.getName();

      if (item.isEquipped() || isDead) {
        const isDropping = true;
        const location = player.unequip(item, items, players, isDropping);
        if (!isDead) { item.emit('remove', location, room, player, players); }
      }

      var shortDesc = item.getShortDesc();
      players.eachIf(
        p => CommandUtil.inSameRoom(p, player),
        p => p.say(`${playerName} drops the ${shortDesc}`)
      );

      if (!isDead) {
        player.say(`You drop ${shortDesc}.`);
        room.getNpcs().forEach( id => {
          let npc = npcs.get(id);
          npc.emit('playerDropItem', room, rooms, player, players, npc, npcs, item, items);
        });
      }
      util.log(`${playerName} drops ${shortDesc} at ${room.getLocation()}.`);

      player.removeItem(item);
      const container = items.get(item.getContainer());
      if (container) { container.removeItem(item); }
      room.addItem(item);
      item.setHolder(null);
      item.setRoom(room.getLocation());
    }
  };
};
