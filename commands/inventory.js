var l10n_file = __dirname + '/../l10n/commands/inventory.yml';
var l10n = require('../src/l10n')(l10n_file);
exports.command = function(rooms, items, players, npcs, Commands) {
  return function(args, player) {
    player.sayL10n(l10n, 'INV');

    // See how many of an item a player has so we can do stuff like (2) apple
    var itemcounts = {};
    player.getInventory()
      .forEach(i => {
        var vnum = i.getVnum();
        if (!i.isEquipped()) {
          itemcounts[vnum] ? itemcounts[vnum] += 1 : itemcounts[vnum] = 1;
        }
      });

    var displayed = {};
    player.getInventory()
      .forEach(i => {
        var vnum = i.getVnum();
        if (!(vnum in displayed) && !i.isEquipped()) {
          displayed[vnum] = 1;
          player.say((itemcounts[vnum] > 1 ? '(' + itemcounts[vnum] + ') ' : '') + i.getShortDesc(player.getLocale()));
        }
      });

      util.log(player.getName() + '\'s inventory: ');
      util.log(displayed);

      if (!Object.keys(displayed).length){
      	player.sayL10n(l10n, 'EMPTY');
      }

  };
};
