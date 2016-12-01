'use strict';

// Syntax: take [item] from [container] (from is optional)

// When finding container/item:
// - Look in room's containers first (looting!)
// - Then look in worn containers.

// When deciding where item goes:
// - If taken from worn container:
// - - Hold in hand if hand is free.
// - - Warn player otherwise.
// - - ?
//TODO: Have drop command search containers for items to drop?

// - If taken from room's container...
// - - Hold in hand if hand is free.
// - - Put in a worn/held container if one is free.
// - - Warn player otherwise.


const util        = require('util');
const _           = require('../src/helpers');
const CommandUtil = require('../src/command_util').CommandUtil;
const ItemUtil    = require('../src/item_util').ItemUtil;
const Broadcast   = require('../src/broadcast').Broadcast;

exports.command = (rooms, items, players, npcs, Commands) =>
  (args, player) => {
    args = args.trim();

    if (!args) {
      return player.warn('Take which item from which container?');
    }

    if (player.isInCombat()) {
      return player.warn('You cannot do that while fighting!');
    }


    const room   = rooms.getAt(player.getLocation());
    const toRoom = Broadcast.toRoom(room, player, null, players);

    const [ itemTarget, containerTarget ] = _.getTargets(args);

    const container = findContainer(containerTarget);

    if (!container) {
      return player.warn('Take ' + itemTarget + ' from which container?');
    }

    const item          = findItemInContainer(itemTarget, container);
    const containerDesc = container.getShortDesc();

    if (!item) {
      toRoom({ thirdPartyMessage: `${player.getName()} roots around in ${containerDesc} and comes up empty-handed.` });
      return player.warn(`Could not find ${itemTarget} in ${containerDesc}.`);
    }

    takeFromContainer(item, container)

    function findContainer(containerTarget) {
      return CommandUtil.findItemInInventory(containerTarget, player, true) || CommandUtil.findItemInRoom(items, containerTarget, room, player, true);
    }

    function findItemInContainer(itemTarget, container) {
      return container
        .getInventory()
        .map(items.get)
        .filter(item => item.hasKeyword(itemTarget))[0];
    };

    function takeFromContainer(item, container) {
            
      const [ tooLarge, tooHeavy ] = ItemUtil.checkInventory(player, item, items);
      const canPickUp = [ tooLarge, tooHeavy ].every( predicate => !predicate );
      const canHold   = player.canHold();

      if (canHold && !tooHeavy) {
        return hold(item, container);
      } else if (canPickUp) {
        return pickUp(item);
      } else { 
        const message = ItemUtil.getFailureMessage(tooLarge, tooHeavy, item);
        return player.warn(message);
      }
    }

    function hold(item, container) {
      return ItemUtil.hold({ player, item }, 
        location => {
          const itemName = item.getShortDesc();
          container.removeItem(item);
          item.emit('hold', location, room, player, players);

          toRoom({
            firstPartyMessage: `You reach into the ${containerDesc} and take the ${itemName}.`,
            thirdPartyMessage: `${player.getName()} reaches into the ${containerDesc} and takes the ${itemName}.`
          });

          player.emit('action', 1, items);

          if (item.getAttribute('damage')) {
            return Commands.player_commands.wield(itemName, player);
          }
        });
    }

    function pickUp(item) {
      return ItemUtil.pickUp({player, item}, 
        destContainer => {
          const destContainerName = destContainer.getShortDesc();
          const itemName          = item.getShortDesc();

          container.removeItem(item);
          toRoom({
            firstPartyMessage: `You reach into the ${containerDesc} and take the ${itemName}, placing it in your ${destContainerName}.`,
            thirdPartyMessage: `${player.getName()} takes the ${itemName} from the ${containerDesc} and places it in their ${destContainerName}.`
          });

          player.emit('action', 1, items);
          
          destContainer.addItem(item);
        });
    }

  /* Use this in take and get eventually, maybe put in item utils? */
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
}
