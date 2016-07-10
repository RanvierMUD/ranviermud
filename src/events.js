'use strict';

//FIXME: Find a way to modularize as much of this as possible.

const util   = require('util'),
  ansi       = require('colorize').ansify,
  sty        = require('sty'),

  Commands   = require('./commands').Commands,
  Channels   = require('./channels').Channels,
  Data       = require('./data').Data,
  Item       = require('./items').Item,
  Player     = require('./player').Player,
  Skills     = require('./skills').Skills,
  Accounts   = require('./accounts').Accounts,
  Account    = require('./accounts').Account,
  EventUtil  = require('./events/event_util').EventUtil,

  //TODO: Deprecate this if possible.
  l10nHelper = require('./l10n');

// Event modules
//TODO: Automate this using fs.
const login         = require('./events/login').event;
const commands      = require('./events/commands').event;
const createAccount = require('./events/createAccount').event;


/**
 * Localization
 */
let l10n = null;
const l10nFile = __dirname + '/../l10n/events.yml';
// shortcut for l10n.translate
let L = null;

//TODO: Pass most of these and l10n into events.
// Some get instantiated in events.
let players  = null;
let player   = null;
let npcs     = null;
let rooms    = null;
let items    = null;
let account  = null;
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
  events: {
    /**
     * Point of entry for the player. They aren't actually a player yet
     * @param Socket telnet socket
     */
    login,

    /**
     * Command loop
     * @param Player player
     */
    commands,

    /**
     * Create an account
     * Note: Do we already ask for a name in the login step?
     * Stages:
     *
     *   done:   This is always the end step, here we register them in with
     *           the rest of the logged in players and where they log in
     *
     * @param object arg This is either a Socket or a Player depending on
     *                  the stage.
     * @param string stage See above
     * @param name  account username
     * @param account player account obj
     */
    createAccount,

    /**
     * Create a player
     * Stages:
     *   check:  See if they actually want to create a player or not
     *   name:   ... get their name
     *   done:   This is always the end step, here we register them in with
     *           the rest of the logged in players and where they log in
     *
     * @param object arg This is either a Socket or a Player depending on
     *                  the stage.
     * @param string stage See above
     */
    createPlayer,

  configure: function (config) {
    players  = players  || config.players;
    items    = items    || config.items;
    rooms    = rooms    || config.rooms;
    npcs     = npcs     || config.npcs;
    accounts = accounts || config.accounts;

    const requiresConfig = ['login', 'commands', 'createAccount'];

    if (!l10n) {
      util.log("Loading event l10n... ");
      l10n = l10nHelper(l10nFile);
      util.log("Done");
    }

    l10n.setLocale(config.locale);

    for (const event in Events.events) {
      const injector = Events.events[event];
      //FIXME: temp kludge lolz
      if (requiresConfig.indexOf(event) !== -1) {
        Events.events[event] = injector(players, items, rooms, npcs, accounts, l10n);
      }
    }



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

exports.Events    = Events;
