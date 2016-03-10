var CommandUtil = require('../src/command_util').CommandUtil;
var l10n_file = __dirname + '/../l10n/commands/remove.yml';
var l10n = require('../src/l10n')(l10n_file);
exports.command = function(rooms, items, players, npcs, Commands) {
  return function(args, player) {
    var thing = CommandUtil.findItemInInventory(args.split(' ')[0], player,
      true);

    if (!thing) {
      player.sayL10n(l10n, 'ITEM_NOT_FOUND');
      return;
    }

    if (!thing.isEquipped()) {
      thing = CommandUtil.findItemInInventory(
        '2.' + args.split(' ')[0],
        player, true);
      console.log(thing);
      if (!thing || !thing.isEquipped()) {
        player.sayL10n(l10n, 'ITEM_NOT_EQUIPPED');
        return;
      }
    }

    player.unequip(thing);
    player.sayL10n(l10n, 'REMOVED', thing.getShortDesc(player.getLocale()));

  };
};