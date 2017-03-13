'use strict';

const sprintf = require('sprintf-js').sprintf;

module.exports = (srcPath, bundlePath) => {
  const B = require(srcPath + 'Broadcast');
  const say = B.sayAt;

  const CommandManager = require(srcPath + 'CommandManager');
  const ItemType = require(srcPath + 'ItemType');
  const Parser = require(srcPath + 'CommandParser').CommandParser;
  const { renderItem } = require(bundlePath + 'ranvier-lib/lib/ItemUtil');

  const subcommands = new CommandManager();
  subcommands.add({
    name: 'list',
    command: state => (vendor, args, player) => {
      const vendorConfig = vendor.getBehavior('vendor');
      const items = getVendorItems(state, vendorConfig.items);
      const tell = genTell(state, vendor, player);

      // show item to player before purchasing
      if (args) {
        const item = Parser.parseDot(args, items);
        if (!item) {
          return tell("I don't carry that item and no, I won't check in back.");
        }

        const vendorItem = vendorConfig.items[item.entityReference];

        B.sayAt(player, renderItem(state, item, player));
        B.sayAt(player, `Cost: <b><white>[${friendlyCurrencyName(vendorItem.currency)}]</white></b> x ${vendorItem.cost}`);
        return;
      }

      // group vendor's items by category then display them
      let itemCategories = {
        [ItemType.POTION]: {
          title: 'Potions',
          items: [],
        },
        [ItemType.ARMOR]: {
          title: 'Armor',
          items: [],
        },
        [ItemType.WEAPON]: {
          title: 'Weapons',
          items: [],
        },
        [ItemType.CONTAINER]: {
          title: 'Containers',
          items: [],
        },
        [ItemType.OBJECT]: {
          title: 'Miscellaneous',
          items: [],
        },
      };

      for (const item of items) {
        itemCategories[item.type].items.push(item);
      }

      for (const [, itemCategory] of Object.entries(ItemType)) {
        const category = itemCategories[itemCategory];
        if (!category.items.length) {
          continue;
        }

        B.sayAt(player, '.' + B.center(78, category.title, 'yellow', '-') + '.');
        for (const item of category.items) {
          const vendorItem = vendorConfig.items[item.entityReference];

          B.sayAt(player,
            '<yellow>|</yellow> ' +
            item.qualityColorize(sprintf('%-48s', `[${item.name}]`)) +
            sprintf(' <yellow>|</yellow> <b>%-26s</b>', B.center(26, friendlyCurrencyName(vendorItem.currency) + ' x ' + vendorItem.cost)) +
            '<yellow>|</yellow> '
          );
        }

        B.sayAt(player, "'" + B.line(78, '-', 'yellow') + "'");
        B.sayAt(player);
      }
    }
  });

  subcommands.add({
    name: 'buy',
    command: state => (vendor, args, player) => {
      const vendorConfig = vendor.getBehavior('vendor');
      const tell = genTell(state, vendor, player);
      if (!args || !args.length) {
        return tell("Well, what do you want to buy?");
      }

      const items = getVendorItems(state, vendorConfig.items);
      const item = Parser.parseDot(args, items);

      if (!item) {
        return tell("I don't carry that item and no, I won't check in back.");
      }

      const vendorItem = vendorConfig.items[item.entityReference];

      const currencyKey = 'currencies.' + vendorItem.currency;
      const playerCurrency = player.getMeta(currencyKey);
      if (!playerCurrency || playerCurrency < vendorItem.cost) {
        return tell(`You can't afford that, it costs ${vendorItem.cost} ${friendlyCurrencyName(vendorItem.currency)}.`);
      }

      if (player.isInventoryFull()) {
        return tell("I don't think you can carry any more.");
      }

      player.setMeta(currencyKey, playerCurrency - vendorItem.cost);
      item.hydrate(state);
      state.ItemManager.add(item);
      player.addItem(item);
      say(player, `<green>You spend <b><white>${vendorItem.cost} ${friendlyCurrencyName(vendorItem.currency)}</white></b> to purchase ${item.display}.</green>`);
      player.save();
    }
  });

  subcommands.add({
    name: 'sell',
    command: state => (vendor, args, player) => {
      const tell = genTell(state, vendor, player);
      const [ itemArg, confirm ] = args.split(' ');

      if (!args || !args.length) {
        tell("What did you want to sell?");
      }

      const item = Parser.parseDot(itemArg, player.inventory);
      if (!item) {
        return say(player, "You don't have that.");
      }

      const sellable = item.getBehavior('sellable');
      if (!sellable) {
        return say(player, "You can't sell that item.");
      }

      if (!['poor', 'common'].includes(item.quality) && confirm !== 'sure') {
        return say(player, "To sell higher quality items use '<b>sell <item> sure</b>'.");
      }

      const currencyKey = 'currencies.' + sellable.currency;
      if (!player.getMeta('currencies')) {
        player.setMeta('currencies', {});
      }
      player.setMeta(currencyKey, (player.getMeta(currencyKey) || 0) + sellable.value);

      say(player, `<green>You sell ${item.display} for <b><white>${sellable.value} ${friendlyCurrencyName(sellable.currency)}</white></b>.</green>`);
      state.ItemManager.remove(item);
    }
  });

  // check sell value of an item
  subcommands.add({
    name: 'value',
    aliases: [ 'appraise', 'offer' ],
    command: state => (vendor, args, player) => {
      const tell = genTell(state, vendor, player);

      if (!args || !args.length) {
        return tell("What did you want me to appraise?");
      }

      const [ itemArg, confirm ] = args.split(' ');

      const targetItem = Parser.parseDot(itemArg, player.inventory);

      if (!targetItem) {
        return say(player, "You don't have that.");
      }

      const sellable = targetItem.getBehavior('sellable');
      if (!sellable) {
        return say(player, "You can't sell that item.");
      }

      tell(`I could give you <b><white>${sellable.value} ${friendlyCurrencyName(sellable.currency)}</white></b> for ${targetItem.display}.</green>`);
    }
  });

  return {
    aliases: [ 'vendor', 'list', 'buy', 'sell', 'value', 'appraise', 'offer' ],
    usage: 'list [search], buy <item>, sell <item>, appraise <item>',
    command: state => (args, player, arg0) => {
      // if list/buy aliases were used then prepend that to the args
      args = (!['vendor', 'list'].includes(arg0) ? arg0 + ' ' : '') + args;

      const vendor = Array.from(player.room.npcs).find(npc => npc.hasBehavior('vendor'));

      if (!vendor) {
        return B.sayAt(player, "You aren't in a shop.");
      }

      const [ command, ...commandArgs ] = args.split(' ');
      const subcommand = subcommands.find(command);

      if (!subcommand) {
        return say(player, "Not a valid shop command. See '<b>help shops</b>'");
      }

      subcommand.command(state)(vendor, commandArgs.join(' '), player);
    }
  };
};

function getVendorItems(state, vendorConfig) {
  return Object.entries(vendorConfig).map(([itemRef]) => {
    const area = state.AreaManager.getAreaByReference(itemRef);
    return state.ItemFactory.create(area, itemRef);
  });
}

function genTell(state, vendor, player) {
  return message => {
    state.ChannelManager.get('tell').send(state, vendor, player.name + ' ' + message);
  };
}

function friendlyCurrencyName(currency) {
  return currency
    .replace('_', ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
  ;
}
