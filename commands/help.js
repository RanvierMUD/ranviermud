'use strict';
const util      = require('util');
const HelpFiles = require('../src/help_files').HelpFiles;
const wrap      = require('wrap-ansi');
const _         = require('../src/helpers');
const sprintf = require('sprintf').sprintf;

// TODO: Rewrite

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

    if (args === 'TOPICS') {
      let topics = [];
      let maxLength = 0;
      for (let topic in HelpFiles) {
        if (topic === 'NOT_FOUND' || topic === 'NO_HELP_FILE') { continue; }
        if (topic.length > maxLength) { maxLength = topic.length; }
        topics.push(topic.toLowerCase());
      }

      //TODO: Extract this (its also used in commands)
      let len = topics.length + 1;
      for (let i = 1; i < len; i++) {
        let endOfColumn = i % 5 === 0;
        player[endOfColumn ? 'say' : 'write'](sprintf('%-' + (maxLength + 1) + 's', topics[i-1]));
      }

      return;
    }

    try      { displayHelpFile(args); }
    catch(e) { util.log(e); }
    finally  { util.log(errMsg); }

    function displayHelpFile(topic) {
      const file = HelpFiles[topic];
      if ( !file) {
        util.log(`(admin help) Help page requested for '${topic}' by '${player.getName()}'`);
        return player.say(`No help pages found for ${topic}.`);
      }

      // --- Helpers for printing out the help files. Help helpers.

      const hr      = ()     => print('<green>---------------------------------'
                                      +      '---------------------------------</green>');
      const title   = txt    => print('<bold>'   +       txt     +     '</bold>');
      const usage   = usage  => print('<cyan>    USAGE: </cyan>' +       usage);
      const options = option => print('<red> - </red>'           +       option);
      const related = topic  => print('<magenta> * </magenta>'   +       topic);

      const maybeForEach = (txt, fn) => _.toArray(txt).forEach(fn);

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
        const defaultTopicsHeader = '<blue>RELATED TOPICS:</blue>';
        player.say(file.topicsHeader || defaultTopicsHeader);
        maybeForEach(file.related, related);
        hr();
      }

    }

  };
};
