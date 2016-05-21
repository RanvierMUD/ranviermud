'use strict';
const util = require('util');
const sprintf = require('sprintf')
  .sprintf;

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {
    util.log(player.getName() + '\'s equipment: ');

    const equipped = player.getEquipped();
    for (let slot in equipped) {
      const item = items.get(equipped[slot]);

      if (!item) {
        util.log("Something doesn't exist: ", equipped[slot]);
        equipped[slot] = null;
      } else {
      player.say(sprintf("%-15s %s", "<" + slot + ">", item.getShortDesc(
        player.getLocale())));
        util.log(item.getShortDesc('en'));
      }
    }

    if (!Object.keys(equipped).length) player.say("You are naked.");

    util.log(equipped);

  };
};
