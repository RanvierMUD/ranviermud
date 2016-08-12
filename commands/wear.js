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
      return player.sayL10n(l10n, 'ITEM_NOT_FOUND');
    }

    wearItem(thing);

    function wearAll() {
      const items = player.getInventory();
      items.forEach(wearItem);
      items.forEach(item => util.log(item.getShortDesc('en')));
    }

    function wearItem(item) {
      if (isWeapon(item)) {
        const keyword = item.getKeywords('en')[0];
        return Commands.player_commands.wield(keyword, player);
      }
      if (isWearable(item) && hasOpenSpot(item)) {
        broadCastWearing(item);
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
      const worn = player.getEquipped(item.getAttribute('wearLocation'));
      if (worn) {
        util.log("Cannot wear due to already wearing an item.");
        player.sayL10n(l10n, 'CANT_WEAR', items.get(worn).getShortDesc('en'));
        return false;
      }
      return true;
    }

    function broadCastWearing(item) {
      player.say('You wear the ' + item.getShortDesc('en') + '.');
      players.eachIf(
        p => CommandUtil.inSameRoom(p, player),
        p => p.sayL10n(l10n, 'OTHER_WEAR', player.getName(), item.getShortDesc('en'))
      );
    }

    function putOn(item) {
      const location = item.getAttribute('wearLocation');
      const room = rooms.getAt(player.getLocation());
      item.emit('wear', location, room, player, players);
      player.equip(location, item);
    }

  };
};
