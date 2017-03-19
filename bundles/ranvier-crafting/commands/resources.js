'use strict';

// Documentation: http://ranviermud.com/extending/commands/

module.exports = (srcPath, bundlePath) => {
  const B = require(srcPath + 'Broadcast');
  const Data =require(srcPath + 'Data');
  const Item = require(srcPath + 'Item');

  const dataPath = bundlePath + 'ranvier-crafting/data/';

  return {
    aliases: [ "materials" ],
    command: state => (args, player) => {
      const playerResources = player.getMeta('resources');

      if (!playerResources) {
        return B.sayAt(player, "You haven't gathered any resources.");
      }

      const resources = Data.parseFile(dataPath + 'resources.yml');

      B.sayAt(player, '<b>Resources</b>');
      B.sayAt(player, B.line(40));
      let totalAmount = 0;
      for (const resourceKey in playerResources) {
        const amount = playerResources[resourceKey];
        const resourceDef = resources[resourceKey];
        totalAmount += amount;

        // create a temporary fake item for the resource for rendering purposes
        const resItem = new Item(null, {
          name: resourceDef.title,
          quality: resourceDef.quality,
          keywords: resourceKey,
          id: 1
        });

        B.sayAt(player, `${resItem.display} x ${amount}`);
      }

      if (!totalAmount) {
        return B.sayAt(player, "You haven't gathered any resources.");
      }
    }
  };
};
