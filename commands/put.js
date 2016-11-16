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

    const [itemTarget, containerTarget] = getTargets(args);

    if (!containerTarget || containerTarget === 'away') {
      const { item } = findStuff(itemTarget);

      if (!item) { return player.warn('Could not find ' + itemTarget + '.'); }

      const container = findOptimalContainer(item);
      putInContainer(item, container);

    } else {
      const { item, container } = findStuff(itemTarget, containerTarget);

      if (!item)      { return player.warn('Could not find ' + itemTarget + '.'); }
      if (!container) { return player.warn('Could not find ' + containerTarget + '.'); }
      putInContainer(item, container);
    }

    // -- helpers --

    //TODO: When inventory is finalized, do a thing where it checks held items first...
    function findStuff(itemTarget, containerTarget) {
      const item = CommandUtil.findItemInRoom(items, itemTarget, room, player, true)
                || CommandUtil.findItemInInventory(itemTarget, player, true);
      const container = containerTarget ?
           CommandUtil.findItemInInventory(itemTarget, player, true)
        || CommandUtil.findItemInRoom(items, containerTarget, room, player, true) :
        null;
      return { item, container };
    }

    function putInSpecifiedContainer(item, container) {
      item.setContainer(container);
      container.addItem(item);
      item.setRoom(null);
      if (room) { room.removeItem(item.getUuid()); }
    }

    function findOptimalContainer(item) {
      // Find optimal container using hella algorithm.
      // Filter all containers in inventory.
      // Then filter for ones that can fit the item.
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
