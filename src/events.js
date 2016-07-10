'use strict';
 /*
  * Place staged events in the events directory.
  * Export the event listener as `exports.events`.
  * Use switch/case to stage events.
  * Use EventUtils for common helper functions.
  */

const util = require('util'),
  ansi = require('colorize').ansify,
  sty = require('sty'),

  Commands = require('./commands').Commands,
  Channels = require('./channels').Channels,
  Data = require('./data').Data,
  Item = require('./items').Item,
  Player = require('./player').Player,
  Skills = require('./skills').Skills,
  Accounts = require('./accounts').Accounts,
  Account = require('./accounts').Account,
  EventUtil = require('./events/event_util').EventUtil,

  //TODO: Deprecate this if possible.
  l10nHelper = require('./l10n');

const eventsDir = __dirname + '/../events';

/**
 * Localization
 */
let l10n = null;
const l10nFile = __dirname + '/../l10n/events.yml';
// shortcut for l10n.translate
let L = null;

//TODO: Pass most of these and l10n into events.
// Some get instantiated in events.
let players = null;
let player = null;
let npcs = null;
let rooms = null;
let items = null;
let account = null;
let accounts = null;

/**
 * Events object is a container for any "context switches" for the player.
 * Essentially anything that requires player input will have its own listener
 * if it isn't just a basic command. Complex listeners are staged.
 * See login or createPlayer for examples
 */
const Events = {
  /**
   * Container for events
   * @var object
   */
  events: {},

  configure: function configureEvents(config) {
    players = players || config.players;
    items = items || config.items;
    rooms = rooms || config.rooms;
    npcs = npcs || config.npcs;
    accounts = accounts || config.accounts;

    const requiresConfig = ['login', 'commands', 'createAccount', 'createPlayer'];

    if (!l10n) {
      util.log("Loading event l10n... ");
      l10n = l10nHelper(l10nFile);
      util.log("Done");
    }

    l10n.setLocale(config.locale);

    fs.readdir(eventsDir,
    (err, files) =>
      if (err) { util.log(err); }
      for (const file in files) {
        const eventFile = eventDir + files[file];

        //TODO: Extract stuff like this into Data module as util funcs.
        const isJsFile   = _file => fs.statSync(_file).isFile() && _file.match(/js$/);
        const isUtilFile = _file => _file.incldes('util');

        if (!isJsFile(eventFile) || isUtilFile(eventFile)) { continue; }

        const injector = require(eventFile).event;
        const name = files[file].split('.')[0];

        Events.events[name] = injector(players, items, rooms, npcs, accounts, l10n);
      }
    });

    /**
     * Hijack translate to also do coloring
     * @param string text
     * @param ...
     * @return string
     */
    L = function (text) {
      return ansi(l10n.translate.apply(null, [].slice.call(arguments)));
    };
  }
};

exports.Events = Events;
