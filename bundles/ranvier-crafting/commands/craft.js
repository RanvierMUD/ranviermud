'use strict';

const sprintf = require('sprintf-js').sprintf;

module.exports = (srcPath, bundlePath) => {
  const B = require(srcPath + 'Broadcast');
  const say = B.sayAt;
  const CommandManager = require(srcPath + 'CommandManager');
  const ItemType = require(srcPath + 'ItemType');
  const Crafting = require(bundlePath + 'ranvier-crafting/lib/Crafting');
  const { renderItem } = require(bundlePath + 'ranvier-lib/lib/ItemUtil');

  const subcommands = new CommandManager();

  /** LIST **/
  subcommands.add({
    name: 'list',
    command: state => (args, player) => {
      const craftingCategories = getCraftingCategories(state);

      // list categories
      if (!args || !args.length) {
        say(player, '<b>Crafting Categories</b>');
        say(player, B.line(40));

        for (const index in craftingCategories) {
          say(player, sprintf('%4d) %s', parseInt(index, 10) + 1, craftingCategories[index].title));
        }

        return;
      }

      let [itemCategory, itemNumber] = args.split(' ');

      itemCategory = parseInt(itemCategory, 10) - 1;
      if (itemCategory < 0 || itemCategory > craftingCategories.length) {
        return say(player, "Invalid category.");
      }

      const category = craftingCategories[itemCategory];

      // list items within a category
      if (!itemNumber) {
        say(player, `<b>${category.title}</b>`);
        say(player, B.line(40));

        if (!category.items.length) {
          return say(player, B.center(40, "No recipes."));
        }

        for (const index in category.items) {
          const item = category.items[index].item;
          say(player, sprintf('%4d) ', index + 1) + item.display);
        }

        return;
      }

      itemNumber = parseInt(itemNumber, 10) - 1;
      if (itemNumber < 0 || itemNumber > category.items.length) {
        return say(player, "Invalid item.");
      }

      const item = category.items[itemNumber];
      say(player, renderItem(state, item.item, player));
      say(player, '<b>Recipe:</b>');
      for (const resource in item.recipe) {
        const resItem = Crafting.getResourceItem(resource);
        say(player, `  ${resItem.display} x ${item.recipe[resource]}`);
      }
    }
  });

  /** CREATE **/
  subcommands.add({
    name: 'create',
    command: state => (args, player) => {
      if (!args || !args.length) {
        return say(player, "Create what? 'craft create 1 1' for example.");
      }

      const craftingCategories = getCraftingCategories(state);

      let [itemCategory, itemNumber] = args.split(' ');

      itemCategory = parseInt(itemCategory, 10) - 1;
      if (isNaN(itemCategory) || itemCategory < 0 || itemCategory > craftingCategories.length) {
        return say(player, "Invalid category.");
      }

      const category = craftingCategories[itemCategory];

      itemNumber = parseInt(itemNumber, 10) - 1;
      if (isNaN(itemNumber) || itemNumber < 0 || itemNumber > category.items.length) {
        return say(player, "Invalid item.");
      }

      const item = category.items[itemNumber];
      // check to see if player has resources available
      for (const resource in item.recipe) {
        const playerResource = player.getMeta(`resources.${resource}`) || 0;
        if (playerResource < item.recipe[resource]) {
          return say(player, `You don't have enough resources. 'craft list ${args}' to see recipe.`);
        }
      }

      if (player.isInventoryFull()) {
        return say(player, "You can't hold any more items.");
      }

      // deduct resources
      for (const resource in item.recipe) {
        const amount = item.recipe[resource];
        player.setMeta(`resources.${resource}`, player.getMeta(`resources.${resource}`) - amount);
        const resItem = Crafting.getResourceItem(resource);
        say(player, `<green>You spend ${amount} x ${resItem.display}.</green>`);
      }

      state.ItemManager.add(item.item);
      player.addItem(item.item);
      say(player, `<b><green>You create: ${item.item.display}.</green></b>`);
      player.save();
    }
  });

  function getCraftingCategories(state) {
    let craftingCategories = [
      {
        type: ItemType.POTION,
        title: "Potion",
        items: []
      },
      {
        type: ItemType.WEAPON,
        title: "Weapon",
        items: []
      },
      {
        type: ItemType.ARMOR,
        title: "Armor",
        items: []
      },
    ];

    const recipes = Crafting.getRecipes();
    for (const recipe of recipes) {
      const recipeItem = state.ItemFactory.create(
        state.AreaManager.getAreaByReference(recipe.item),
        recipe.item
      );

      const catIndex = craftingCategories.findIndex(cat => {
        return cat.type === recipeItem.type;
      });

      if (catIndex === -1) {
        continue;
      }

      craftingCategories[catIndex].items.push({
        item: recipeItem,
        recipe: recipe.recipe
      });
    }

    return craftingCategories;
  }

  return {
    command: state => (args, player) => {
      if (!args.length) {
        return say(player, "Missing craft command. See 'help craft'");
      }

      const [ command, ...subArgs ] = args.split(' ');

      const subcommand = subcommands.find(command);
      if (!subcommand) {
        return say(player, "Invalid command. Use craft list or craft create.");
      }

      subcommand.command(state)(subArgs.join(' '), player);
    }
  };
};
