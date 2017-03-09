'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Parser = require(srcPath + 'CommandParser').CommandParser;
  const say = Broadcast.sayAt;

  class ShopCommand {
    static list(state, player, options) {
      say(player, 'LIST: TODO');
    }

    static buy(state, player, options) {
      say(player, 'BUY: TODO');
    }

    static sell(state, player, options) {
      say(player, 'SELL: TODO');
    }
  }

  return {
    usage: 'shop <list/buy/sell> [item # / name]',
    command : (state) => (args, player) => {
      args = args.trim();

      if (!args.length) {
        return say(player, "Missing command. See 'help quest'");
      }

      const [command, ...options] = args.split(' ');

      if (Reflect.has(ShopCommand, command)) {
        return ShopCommand[command](state, player, options);
      }

      say(player, "Invalid command. See 'help shop'");
    }
  };
};
