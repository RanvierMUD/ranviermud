'use strict';
const l10nFile  = __dirname + '/../l10n/commands/help.yml';
const l10n      = require('../src/l10n')(l10nFile);
const util      = require('util');
const HelpFiles = require('../src/help_files').HelpFiles;
const wrap      = require('wrap-ansi');

/*
  NEW: {
    title: 'Welcome to Ranvier',
    body: 'Important topics include:',
    related: 'levels','attributes','mutants','mental','physical','energy','combat','social',
  },
*/

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {
    const print = txt => player.say(wrap(txt, 80));

    if (!args) {
      displayHelpFile('HELP');
      return displayHelpFile('NEW');
    }

    args = args.toUpperCase().trim();
    const errMsg = "" + player.getName() +
                   " attempted to get a helpfile for "
                   + args + ".";

    try      { displayHelpFile(args); }
    catch(e) { util.log(e); }
    finally  { util.log(errMsg); }

    function displayHelpFile(topic) {
      const file = HelpFiles[topic];
      if ( !file) {
        return args in Commands.player_commands  ?
          player.writeL10n(l10n, 'NO_HELP_FILE') :
          player.writeL10n(l10n, 'NOT_FOUND');
      }

      // --- Helpers for printing out the help files. Help helpers.

      const hr      = ()     => print('<green>---------------------------------'
                                      + '------------------------------</green>');
      const title   = txt    => print('<bold>'   +       txt     +     '</bold>');
      const usage   = usage  => print('<cyan>    USAGE: </cyan>' +       usage);
      const options = option => print('<red> - </red>'           +       option);
      const related = topic  => print('<magenta> * </magenta>'   +       topic);

      const maybeForEach = (txt, fn) => [].concat(txt).forEach(fn);

      hr();

      if (file.title)   { title(file.title); }
      if (file.body)    { print(file.body); }
      if (file.usage)   { maybeForEach(file.usage, usage); }

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
