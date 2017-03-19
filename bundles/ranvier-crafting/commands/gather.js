'use strict';

module.exports = (srcPath, bundlePath) => {
  const B = require(srcPath + 'Broadcast');
  const { CommandParser } = require(srcPath + 'CommandParser');
  const Data =require(srcPath + 'Data');
  const Random = require(srcPath + 'RandomUtil');
  const Item = require(srcPath + 'Item');

  const dataPath = bundlePath + 'ranvier-crafting/data/';

  return {
    command: state => (args, player) => {
      if (!args || !args.length) {
        return B.sayAt(player, "Gather what?");
      }

      let node = CommandParser.parseDot(args, player.room.items);

      if (!node) {
        return B.sayAt(player, "You don't see anything like that here.");
      }

      const resource = node.getBehavior('resource');
      if (!resource) {
        return B.sayAt(player, "You can't gather anything from that.");
      }

      const resources = Data.parseFile(dataPath + 'resources.yml');

      if (!player.getMeta('resources')) {
        player.setMeta('resources', {});
      }

      let result = [];
      for (const material in resource.materials) {
        const entry = resource.materials[material];
        const resourceDef = resources[material];
        const amount = Random.inRange(entry.min, entry.max);
        if (amount) {
          // create a temporary fake item for the resource for rendering purposes
          const resItem = new Item(null, {
            name: resourceDef.title,
            quality: resourceDef.quality,
            keywords: material,
            id: 1
          });

          const metaKey = `resources.${material}`;
          player.setMeta(metaKey, (player.getMeta(metaKey) || 0) + amount);
          B.sayAt(player, `<green>You gather: ${resItem.display} x${amount}.`);
        }
      }

      // destroy node, will be respawned
      state.ItemManager.remove(node);
      B.sayAt(player, `${node.display} ${resource.depletedMessage}`);
      node = null;
    }
  };
};
