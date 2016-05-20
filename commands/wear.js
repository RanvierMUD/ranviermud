'use strict';
const util = require('util');
const CommandUtil = require('../src/command_util').CommandUtil;
const l10nFile = __dirname + '/../l10n/commands/wear.yml';
const l10n = require('../src/l10n')(l10nFile);

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {
    var cmds = args.split(' ');

    var thing = cmds[0];
    thing = CommandUtil.findItemInInventory(thing, player, true);
    if (!thing) {
      player.sayL10n(l10n, 'ITEM_NOT_FOUND');
      return;
    }

    if (!thing.getAttribute('wear_location')) {
      util.log("No wear location.");
      player.sayL10n(l10n, 'NO_WEAR_LOCATION', thing.getShortDesc(player.getLocale()));
      return;
    }

    var wear = player.getEquipped(thing.getAttribute('wear_location'));
    if (wear) {
      util.log("Cannot wear due to already wearing an item.");
      player.sayL10n(l10n, 'CANT_WEAR', items.get(wear).getShortDesc(player
        .getLocale()));
      return;
    }

    players.eachIf(
      p => CommandUtil.otherPlayerInRoom(p, player),
      p => {
        p.sayL10n(l10n, 'OTHER_WEAR', player.getName(), thing.getShortDesc(
          p.getLocale()));
        p.prompt();
      });

    var location = thing.getAttribute('wear_location');
    // thing.emit('wear', location, player, players);
    //FIXME: Emitting wear does not always work. Perhaps due to items lackign scripts.
    player.equip(location, thing);
    player.sayL10n(l10n, 'YOU_WEAR', thing.getShortDesc(player.getLocale()));
  };
};
