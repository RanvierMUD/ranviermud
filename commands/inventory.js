'use strict';
const l10n_file = __dirname + '/../l10n/commands/inventory.yml';
const l10n = require('../src/l10n')(l10n_file);
const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {
    player.sayL10n(l10n, 'INV');

    // See how many of an item a player has so we can do stuff like (2) apple
    const itemCounts = {};
    const inventory = player.getInventory();
    inventory.forEach(item => {
        const vnum = item.getVnum();
        if (!item.isEquipped()) {
          itemCounts[vnum] ? itemCounts[vnum] += 1 : itemCounts[vnum] = 1;
        }
      });

    const displayed = {};
    inventory.forEach(item => {
        const vnum = item.getVnum();
        if (!(vnum in displayed) && !item.isEquipped()) {
          displayed[vnum] = 1;
          player.say((itemCounts[vnum] > 1 ? '(' + itemCounts[vnum] + ') ' : '') + item.getShortDesc(player.getLocale()));
        }
      });

      util.log(player.getName() + '\'s inventory: ');
      util.log(displayed);

      if (!Object.keys(displayed).length){
      	player.sayL10n(l10n, 'EMPTY');
      }

  };
};
