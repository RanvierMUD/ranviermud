'use strict';

module.exports = srcPath => {
  const B = require(srcPath + 'Broadcast');
  const Parser = require(srcPath + 'CommandParser').CommandParser;
  const say = B.sayAt;

  const ShopCommands = (config, state, player) => {
    return [
      {
        name: 'buy',
        run(args) {
          say(player, 'TODO: BUY');
        }
      },

      {
        name: 'sell',
        run(args) {
          say(player, 'TODO: SELL');
        }
      },
      {
        name: 'list',
        run(args) {
          const [vendor, item] = args;
          say(player, 'TODO: LIST');
        }
      }
    ];
  };

  return {
    aliases: [ 'vendor' ],
    command: state => (args, player) => {

      if (!args || !args.length) {
        args = 'list';
      }

      //For now we are handling 1 cause my brain hurts
      const vendor = Array.from(player.room.npcs).find(npc => npc.hasBehavior('vendor'));

      if (!vendor) {
        return B.sayAt(player, "Vendor not found, are you ok?");
      }

      const parts = args.split(' ');
      const commandName = parts[0];
      args = parts.slice(1).join(' ');

      let command = null;
      for (const shopCommand of ShopCommands(vendor.getBehavior('vendor'), state, player)) {
        if (shopCommand.name.includes(commandName)) {
          command = shopCommand;
          break;
        }
      }

      if (!command) {
        return say(player, "Not a valid shop command.");
      }

      command.run(args);
    }
  };
};
