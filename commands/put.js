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

exports.command = (rooms, items, players, npcs, Commands) =>
  (args, player) => {
    args = args.trim();

    if (!args) {
      return player.warn('Put which item into which container?');
    }

    const room = rooms.getAt(player.getLocation());

    const [ itemTarget, containerTarget ] = _.getTargets(args);

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
      container.addItem(item);
      item.setRoom(null);
      const holder = container.getHolder() || null;
      item.setHolder(holder);
      if (room) { room.removeItem(item.getUuid()); }
      player.say('you put the thing in the stuff');
    }

  };
