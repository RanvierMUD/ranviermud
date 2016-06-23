'use strict';
const l10nFile = __dirname + '/../l10n/commands/help.yml';
const l10n = require('../src/l10n')(l10nFile);
const util = require('util');
const HelpFiles = require('../src/help_files').HelpFiles;

/*
  NEW: {
    title: 'Welcome to Ranvier',
    body: 'Important topics include:',
    related: 'levels','attributes','mutants','mental','physical','energy','combat','social',
  },
*/

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {

    if (!args) {
      displayHelpFile('HELP');
      return;
    }

    args = args.toUpperCase().trim();

    displayHelpFile(args);
    // const errMsg = "" + player.getName() + " attempted to get a helpfile for " + args + " and this happened: ";

    function displayHelpFile(topic) {
      const file = HelpFiles[topic];

      if (!file) {
        return args in Commands.player_commands ?
          player.writeL10n(l10n, 'NO_HELP_FILE') : player.writeL10n(l10n, 'NOT_FOUND');
      }

      const hr = () => player.say('---------------------------------');
      const title = txt => player.say('<bold>' + txt + '</bold>');
      const usage = usage => player.say('<cyan>    USAGE:</cyan> ' + usage);
      const options = option => player.say('<red> - </red>' + option);
      const listTopic = topic => player.say('<magenta> * </magenta>' + topic);

      const maybeForEach = (txt, fn) => Array.isArray(txt) ? txt.forEach(fn) : fn(txt);

      hr();
      if (file.title) { title(file.title); }
      if (file.body) { player.say(file.body); }
      if (file.usage) { maybeForEach(file.usage, usage); }
      hr();
      if (file.options) {
        player.say('<green>OPTIONS:</green>');
        maybeForEach(file.options, options);
        hr();
      }
      if (file.related) {
        player.say('<blue>RELATED TOPICS:</blue>');
        maybeForEach(file.related, related);
        hr();
      }

    }


  };
};
