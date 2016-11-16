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
      const item =
        CommandUtil.findItemInRoom(items, itemTarget, room, player, true) ||
        CommandUtil.findItemInInventory(itemTarget, player, true);
      if (!item) { return player.warn('Could not find ' + itemTarget + '.'); }
      putInLargestWornContainer(item);
    } else {
      const item =
        CommandUtil.findItemInRoom(items, itemTarget, room, player, true) ||
        CommandUtil.findItemInInventory(itemTarget, player, true);
      if (!item) { return player.warn('Could not find ' + itemTarget + '.'); }

      const container =
        CommandUtil.findItemInInventory(itemTarget, player, true) ||
        CommandUtil.findItemInRoom(items, containerTarget, room, player, true);
      if (!container) { return player.warn('Could not find ' + containerTarget + '.'); }

      putInSpecifiedContainer(item, container);
    }

    function putInSpecifiedContainer(item, container) {

    }

    function putInLargestWornContainer(item) {
      // Find optimal container using hella algorithm.
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
