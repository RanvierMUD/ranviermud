'use strict';

const LootTable = require('../../lib/LootTable');

module.exports = srcPath => {
  const B = require(srcPath + 'Broadcast');
  const Player = require(srcPath + 'Player');
  const Item = require(srcPath + 'Item');
  const Logger = require(srcPath + 'Logger');

  return {
    listeners: {
      killed: state => function (config, killer) {
        const lootTable = new LootTable(state, config);
        const currencies = lootTable.currencies();
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
          },
          behaviors: {
            decay: {
              duration: 180
            }
          },
        });

        const behavior = state.ItemBehaviorManager.get('decay');
        behavior.attach(corpse, { duration: 180 });

        Logger.log(`Generated corpse: ${corpse.uuid}`);

        items.forEach(item => corpse.addItem(item));

        this.room.addItem(corpse);
        state.ItemManager.add(corpse);
        if (killer && killer instanceof Player) {
          if (currencies) {
            currencies.forEach(currency => {
              const friendlyName = currency.name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
              B.sayAt(killer, `<green>You loot: </green><white>${currency.amount} [${friendlyName}]</white><green>.</green>`);
              if (!killer.getMeta('currencies')) {
                killer.setMeta('currencies', {});
              }

              const key = `currencies.${currency.name}`;
              killer.setMeta(key, (killer.getMeta(key) || 0) + currency.amount);
            });
          }

          state.CommandManager.get('look').execute(corpse.uuid, killer);
        }
      }
    }
  };
};
