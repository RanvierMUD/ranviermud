'use strict';

const util = require('util');

const _ = require('./helpers');

const l10n_dir = __dirname + '/../l10n/skills/';
let l10ncache = {};

/**
 * Localization helper
 * @return string
 */
const L = function(locale, cls, key /*, args... */ ) {
  const l10nFile = l10n_dir + cls + '.yml';
  const l10n = l10ncache[cls + locale] || require('./l10n')(l10nFile);
  l10n.setLocale(locale);
  return l10n.translate.apply(null, [].slice.call(arguments).slice(2));
};

// For activate functions:
// Command event passes in player, args, rooms, npcs, players.

//TODO: Pull into own files.

exports.Skills = {

  //// Passive skills
  dual: {
    id: "dual",
    cost: 2,
    name: "Dual Wield",
    description: "Your ability to deftly use two (or more...) weapons at once.",
    usage: "Wield two one-handed weapons. Enjoy.",
    attribute: "quickness",
    type: "passive",
    activate: player => util.log(player.getName() + ' can dual wield.'),
  },

  parrying: {
    id: "parrying",
    cost: 1,
    name: "Parrying",
    description: "Your ability to parry with weapons or shields.",
    usage: "Use a shield or wield a weapon.",
    attribute: "cleverness",
    type: "passive",
    activate: player => util.log(player.getName() + ' can parry.')
  },

  athletics: {
    id: "athletics",
    cost: 1,
    name: "Athletics",
    description: "You recover more quickly from physical exertion.",
    usage: "Try resting or meditating to recuperate your energy.",
    attribute: "stamina",
    type: "passive",
    activate: () => {},
  },

  concentration: {
    id: "concentration",
    cost: 1,
    name: "Concentration",
    description: "You recover more quickly from mental exertion.",
    usage: "Try meditating to increase focus and reduce stress.",
    attribute: "willpower",
    type: "passive",
    activate: () => {},
  },

  recovery: {
    id: "recovery",
    cost: 1,
    name: "Recovery",
    description: "Your wounds heal more quickly.",
    usage: "Try resting to recover from wounds or ailments.",
    attribute: "stamina",
    type: "passive",
    activate: () => {},
  },

  dodging: {
    id: "dodging",
    cost: 1,
    name: "Dodging",
    description: "The ability to avoid getting hit.",
    usage: "When in combat, use `stance precise` or `stance cautious`.",
    attribute: "quickness",
    type: "passive",
    activate: () => {},
  },

  //// Active skills
  pick: {
    id: "pick",
    cost: 2,
    name: "Lockpick",
    description: "Your ability to illicitly open locked doors or containers.",
    usage: "`pick [exit]`",
    attribute: "cleverness",
    type: "active",
    activate: (player, target, rooms, npcs, players) => {
      if (!target) { return player.say("Which door's lock do you want to pick?"); }
      target = target.toLowerCase();

      const room  = rooms.getAt(player.getLocation());
      const exits = room.getExits();
      const name  = player.getName();
      const possibleTargets = exits
        .filter(exit => _.has(exit.direction, target));

      util.log(name + ' is trying to pick a lock...');

      if (possibleTargets && possibleTargets.length === 1) {
        const exit = possibleTargets[0];
        const attemptLockpick = require('../skills/lockpick');
        return attemptLockpick(player, players, rooms, exit);
      } else if (possibleTargets && possibleTargets.length) {
        return player.say("Which door's lock do you want to pick?");
      } else {
        return player.say("There doesn't seem to be an exit in that direction, much less a lock to pick.");
      }
    },
  }
};
