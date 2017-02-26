'use strict';

const util = require('util');

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    usage: 'help [search] [topic keyword]',
    command: (state) => (args, player) => {
      if (!args.length) {
        // look at `help help` if they haven't specified a file
        return state.CommandManager.get('help').execute('help', player);
      }

      // `help search`
      if (args.indexOf('search') === 0) {
        return searchHelpfiles(args, player, state);
      }

      const hfile = state.HelpManager.get(args);

      if (!hfile) {
        util.log(`MISSING-HELP: [${args}]`);
        return Broadcast.sayAt(player, "Sorry, I couldn't find an entry for that topic.");
      }

      Broadcast.sayAt(player, hfile.render(state));
    }
  };

  function searchHelpfiles(args, player, state) {
    args = args.split(' ').slice(1).join(' ');
    if (!args.length) {
      // `help search` syntax is included in `help help`
      return state.CommandManager.get('help').execute('help', player);
    }

    const results = state.HelpManager.find(args);
    if (!results.size) {
      return Broadcast.sayAt(player, "Sorry, no results were found for your search.");
    }
    if (results.size === 1) {
      const [ _, hfile ] = [...results][0];
      return Broadcast.sayAt(player, hfile.render(state));
    }
    Broadcast.sayAt(player, "<yellow>---------------------------------------------------------------------------------</yellow>");
    Broadcast.sayAt(player, "<white>Search Results:</white>");
    Broadcast.sayAt(player, "<yellow>---------------------------------------------------------------------------------</yellow>");

    for (const [name, help] of results) {
      Broadcast.sayAt(player, `<cyan>${name}</cyan>`);
    }
  }

};
