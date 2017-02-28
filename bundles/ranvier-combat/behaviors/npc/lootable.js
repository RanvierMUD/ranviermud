'use strict';

const LootTable = require('../../lib/LootTable');

module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Player = require(srcPath + 'Player');
  const Item = require(srcPath + 'Item');

  return {
    listeners: {
      killed: state => function (config, killer) {
        const lootTable = new LootTable(config);
        const items = lootTable.roll().map(
          item => state.ItemFactory.create(state.AreaManager.getAreaByReference(item), item)
        );

        const corpse = new Item(this.area, {
          id: 'corpse',
          name: `Corpse of ${this.name}`,
          roomDesc: `Corpse of ${this.name}`,
          description: `The rotting corpse of ${this.name}`,
          keywords: this.keywords.concat(['corpse']),
          type: 'CONTAINER',
          attributes: {
            noPickup: true,
            maxItems: items.length
          }
        });

        console.log(`Generated corpse: ${corpse.uuid}`);

        items.forEach(item => corpse.addItem(item));

        this.room.addItem(corpse);

        if (killer && killer instanceof Player) {
          state.CommandManager.get('look').execute(corpse.uuid, killer);
        }
      }
    }
  };
};
