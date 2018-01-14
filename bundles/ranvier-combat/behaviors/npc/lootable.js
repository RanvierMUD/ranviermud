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
          metadata: {
            noPickup: true,
          },
          maxItems: items.length,
          behaviors: {
            decay: {
              duration: 180
            }
          },
        });
        corpse.hydrate(state);

        Logger.log(`Generated corpse: ${corpse.uuid}`);

        items.forEach(item => {
          item.hydrate(state);
          corpse.addItem(item)
        });
        this.room.addItem(corpse);
        state.ItemManager.add(corpse);

        if (killer && killer instanceof Player) {
          if (currencies) {
            currencies.forEach(currency => {
              // distribute currency among group members in the same room
              const recipients = (killer.party ? [...killer.party] : [killer]).filter(recipient => {
                return recipient.room === killer.room;
              });

              let remaining = currency.amount;
              for (const recipient of recipients) {
                // Split currently evenly amount recipients.  The way the math works out the leader
                // of the party will get any remainder if the currency isn't divisible evenly
                const amount = Math.floor(remaining / recipients.length) + (remaining % recipients.length);
                remaining -= amount;

                recipient.emit('currency', currency.name, amount);
                state.CommandManager.get('look').execute(corpse.uuid, recipient);
              }
            });
          }
        }
      }
    }
  };
};
