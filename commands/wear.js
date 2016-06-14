'use strict';
const util = require('util');
const CommandUtil = require('../src/command_util').CommandUtil;
const l10nFile = __dirname + '/../l10n/commands/wear.yml';
const l10n = require('../src/l10n')(l10nFile);

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {
    const cmds = args.toLowerCase().split(' ');

    let thing = cmds[0];
    if (thing === 'all') {
      wearAll();
      return;
    }

    thing = CommandUtil.findItemInInventory(thing, player, true);
    if (!thing) {
      player.sayL10n(l10n, 'ITEM_NOT_FOUND');
      return;
    }

    return wearItem(thing);

    function wearAll() {
      const items = player.getInventory();
      items.forEach(wearItem);
      items.forEach(item => util.log(item.getShortDesc('en')));
    }

    function wearItem(item) {
      if (isWearable(item) && hasOpenSpot(item)) {
        broadCastWearing(item);
        return putOn(item);
      }
      return false;
    }

    function isWearable(item) {
      if (!item.getAttribute('wearLocation')) {
        util.log("No wear location:" , item.getShortDesc('en'), item.wearLocation);
        player.sayL10n(l10n, 'NO_WEAR_LOCATION', item.getShortDesc(player.getLocale()));
        return false;
      }
      return true;
    }

    function hasOpenSpot(item) {
      const worn = player.getEquipped(item.getAttribute('wearLocation'));
      if (worn) {
        util.log("Cannot wear due to already wearing an item.");
        player.sayL10n(l10n, 'CANT_WEAR', items.get(worn).getShortDesc(player.getLocale()));
        return false;
      }
      return true;
    }

    function broadCastWearing(item) {
      players.eachIf(
        p => CommandUtil.inSameRoom(p, player),
        p => p.sayL10n(l10n, 'OTHER_WEAR', player.getName(), item.getShortDesc(p.getLocale()))
      );
    }

    function putOn(item) {
      const location = item.getAttribute('wearLocation');
      const hasWearScript = CommandUtil.hasScript(item, 'wear');

      //FIXME: Add wear scripts to items.
      if (hasWearScript) { item.emit('wear', location, player, players); }
      player.equip(location, item);
      player.sayL10n(l10n, 'YOU_WEAR', item.getShortDesc(player.getLocale()));
    }

  };
};
