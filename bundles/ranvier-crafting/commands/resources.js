'use strict';

// Documentation: http://ranviermud.com/extending/commands/

module.exports = (srcPath, bundlePath) => {
  const B = require(srcPath + 'Broadcast');
  const Crafting = require(bundlePath + 'ranvier-crafting/lib/Crafting');
  const ItemUtil = require(bundlePath + 'ranvier-lib/lib/ItemUtil');

  return {
    aliases: [ "materials" ],
    command: state => (args, player) => {
      const playerResources = player.getMeta('resources');

      if (!playerResources) {
        return B.sayAt(player, "You haven't gathered any resources.");
      }

      B.sayAt(player, '<b>Resources</b>');
      B.sayAt(player, B.line(40));
      let totalAmount = 0;
      for (const resourceKey in playerResources) {
        const amount = playerResources[resourceKey];
        totalAmount += amount;

        const resItem = Crafting.getResourceItem(resourceKey);
        B.sayAt(player, `${ItemUtil.display(resItem)} x ${amount}`);
      }

      if (!totalAmount) {
        return B.sayAt(player, "You haven't gathered any resources.");
      }
    }
  };
};
