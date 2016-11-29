'use strict';
const util = require('util');
const CommandUtil = require('../src/command_util').CommandUtil;
const Commands    = require('../src/commands.js');
const l10nFile = __dirname + '/../l10n/commands/wear.yml';
const l10n = require('../src/l10n')(l10nFile);

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {
    const cmds = args.toLowerCase().split(' ');

    let thing = cmds[0];
    if (thing === 'all') {
      return wearAll();
    }

    thing = CommandUtil.findItemInInventory(thing, player, true);
    if (!thing) {
      return player.say(`You do not seem to have ${args} in your possessions...`);
    }

    if (thing.isEquipped() && !isHeld(thing)) {
      return player.say(`You seem to already be wearing the ${thing.getShortDesc()}.`);
    }

    wearItem(thing);

    function isHeld(item) {
      const equipment = player.getEquipped();
      return ['held', 'offhand held'].some(slot => item.getUuid() === equipment[slot]);
    }

    function wearAll() {
      const items = player.getInventory().filter(item => !item.isEquipped() || isHeld(item));
      if (!items.length) { return player.say("You have nothing to wear."); }
      items.forEach(wearItem);
    }

    function wearItem(item) {
      const itemContainer = item.getContainer();
      if (itemContainer) {
        itemContainer.removeItem(item);
      }
      if (isWeapon(item)) {
        const keyword = item.getKeywords('en')[0];
        return Commands.player_commands.wield(keyword, player);
      }
      if (isWearable(item) && hasOpenSpot(item)) {
        return putOn(item);
      }
      return false;
    }

    function isWeapon(item) {
      return !!item.getAttribute('damage');
    }

    function isWearable(item) {
      if (!item.getAttribute('wearLocation')) {
        util.log("No wear location:" , item.getShortDesc('en'), item.wearLocation);
        player.sayL10n(l10n, 'NO_WEAR_LOCATION', item.getShortDesc('en'));
        return false;
      }
      return true;
    }

    function hasOpenSpot(item) {
      const wearLocation = item.getAttribute('wearLocation');
      const worn         = player.getEquipped(wearLocation);
      
      if (worn) {
        util.log(`${player.getName()}: Cannot wear ${item.getShortDesc()} due to already wearing an item: ${worn} on ${wearLocation}`);
        player.warn(`You cannot wear the ${item.getShortDesc()}, you are already wearing the ${items.get(worn).getShortDesc('en')} on your ${wearLocation}.`);
        return false;
      }
      return true;
    }

    function putOn(item) {
      const location = item.getAttribute('wearLocation');
      const room     = rooms.getAt(player.getLocation());
      
      item.emit('wear', location, room, player, players);
      player.equip(location, item);
      return true;
    }

  };
};
