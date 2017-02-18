'use strict';

const util = require('util');

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    usage: 'help',
    command: (state) => (args, player) => {
      if (!args.length) {
        // look at `help help` if they haven't specified a file
        return state.CommandManager.get('help').execute('help', player);
      }
      const hfile = state.HelpManager.get(args);

      if (!hfile) {
        util.log(`MISSING-HELP: [${args}]`);
        return Broadcast.sayAt(player, "Sorry, I couldn't find an entry for that topic.");
      }

      Broadcast.sayAt(player, hfile.render(state));
    }
  };
};
