'use strict';

const util        = require('util');
const CommandUtil = require('../src/command_util').CommandUtil;

exports.command = (rooms, items, players, npcs, Commands) =>
  (args, player) => {
    args = args.trim();
    // syntax: put [item] in [container] or put [item] [container]
    //TODO: Change get to auto-put or auto-hold...

    // When finding item to put in container:
    // - Look at held items first.
    // - Then look in the room at large.

    // When finding container:
    // - Look at worn containers first (inventory)
    // - Then nested containers
    // - Finally, look in room

    if (!args) {
      player.warn('Put which item into which container?');
    }

    const room = rooms.getAt(player.getLocation());

    const [ itemTarget, containerTarget ] = getTargets(args);

    const item      = findItem(itemTarget);
    const container = findContainer(containerTarget);

    if (!item)      { return player.warn('Could not find ' + itemTarget + '.'); }
    if (!container) { return player.warn('Could not find ' + containerTarget + '.'); }
    putInContainer(item, container);

    // -- helpers --

    function findItem(itemTarget) {
      return CommandUtil.findItemInRoom(items, itemTarget, room, player, true) || CommandUtil.findItemInInventory(itemTarget, player, true);
    }

    function findContainer(containerTarget) {
      return containerTarget ?
        CommandUtil.findItemInInventory(containerTarget, player, true) || CommandUtil.findItemInRoom(items, containerTarget, room, player, true) :
        null;
    }

    function putInContainer(item, container) {
      console.log('ARGS FOR PUT: ', arguments);
      container.addItem(item);
      item.setRoom(null);
      item.setHolder(player.getName());
      if (room) { room.removeItem(item.getUuid()); }
    }

    //TODO: SAVE THIS FOR TAKE/GET?
    function findOptimalContainer(item) {
      const inventory  = player.getInventory();
      const itemSize   = item.getAttribute('size')   || 1;
      const itemWeight = item.getAttribute('weight') || 1;

      const availableContainers = inventory
        .filter(item => item.isContainer());

      return availableContainers[0] || null;
      // TODO: Then filter for ones that can fit the item.
    }

  };

function getTargets(args) {
  args = args.split(' ');

  switch(args.length) {
    case 1:
      return [ args[0], null ];
    case 3:
      return removePreposition(args);
    default:
      return args;
  }
}

function removePreposition(args) {
  const prepositions = ['from', 'in', 'into'];
  return args.filter(word => !prepositions.includes(word));
}
