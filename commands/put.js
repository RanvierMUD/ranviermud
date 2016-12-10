'use strict';

// syntax: put [item] in [container] or put [item] [container]
//TODO: Change get to auto-put or auto-hold...

// When finding item to put in container:
// - Look at held items first.
// - Then look in the room at large.

// When finding container:
// - Look at worn containers first (inventory)
// - Then nested containers
// - Finally, look in room

const util        = require('util');
const _           = require('../src/helpers');
const CommandUtil = require('../src/command_util').CommandUtil;
const Broadcast   = require('../src/broadcast').Broadcast;

exports.command = (rooms, items, players, npcs, Commands) =>
  (args, player) => {
    args = args.trim();

    if (!args) {
      return player.warn('Put which item into which container?');
    }

    if (player.isInCombat()) {
      return player.warn('You cannot do that while fighting!');
    }

    const room   = rooms.getAt(player.getLocation());
    const toRoom = Broadcast.toRoom(room, player, null, players);

    const [ itemTarget, containerTarget ] = _.getTargets(args);

    const item      = findItem(itemTarget);
    const container = findContainer(containerTarget);

    if (!item)      { return player.warn(`Could not find ${itemTarget}.`); }
    if (!container) { return player.warn(`Could not find ${containerTarget}.`); }

    putInContainer(item, container);

    // -- helpers -- //TODO: Put in CommandUtil?

    function findItem(itemTarget) {
      return CommandUtil.findItemInRoom(items, itemTarget, room, player, true) || CommandUtil.findItemInInventory(itemTarget, player, true);
    }

    function findContainer(containerTarget) {
      return containerTarget ?
        player.getContainerWithCapacity(items, item.getAttribute('size')) :
        CommandUtil.findItemInRoom(items, containerTarget, room, player, true) || null;
    }

    function putInContainer(item, container) {
      container.addItem(item);
      
      if (item.isEquipped()) {
        item.setEquipped(false);
        const isDropping = true; //TODO: Come up with better param name...
        player.unequip(item, items, players, isDropping);
      }
      
      const holder = container.getHolder() || null;
      item.setHolder(holder);
      player.removeItem(item);
     
      item.setRoom(null);
      if (room) { room.removeItem(item); }

      const containerDesc = container.getShortDesc();
      const itemName = item.getShortDesc();
      toRoom({
        firstPartyMessage: 'You place the ' + itemName + ' into the ' + containerDesc + '.',
        thirdPartyMessage: player.getName() + ' places the ' + itemName + ' into the ' + containerDesc + '.'
      });
      
      player.emit('action', 1, items);

    }

  };
