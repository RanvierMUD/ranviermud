'use strict';
 /*
  * Place staged events in the events directory.
  * Export the event listener as `exports.events`.
  * Use switch/case to stage events.
  * Use EventUtils for common helper functions.
  */

const util = require('util'),
  ansi = require('colorize').ansify,
  sty  = require('sty'),
  fs   = require('fs'),

  Commands = require('./commands').Commands,
  Channels = require('./channels').Channels,
  Data = require('./data').Data,
  Item = require('./items').Item,
  Player = require('./player').Player,
  Skills = require('./skills').Skills,
  Accounts = require('./accounts').Accounts,
  Account = require('./accounts').Account,
  EventUtil = require('../events/event_util').EventUtil
;
const eventsDir = __dirname + '/../events/';

// Deps to be injected into events
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

    fs.readdir(eventsDir,
    (err, files) => {
      if (err) { util.log(err); }
      for (const file in files) {
        const eventFile = eventsDir + files[file];

        //TODO: Extract stuff like this into Data module as util funcs.
        const isJsFile   = _file => fs.statSync(_file).isFile() && _file.match(/js$/);
        const isUtilFile = _file => _file.includes('util');

        if (!isJsFile(eventFile) || isUtilFile(eventFile)) { continue; }

        const injector = require(eventFile).event;
        const name = files[file].split('.')[0];

        Events.events[name] = injector(players, items, rooms, npcs, accounts);
      }
    });
  }
};

exports.Events = Events;
