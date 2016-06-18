'use strict';
const Effects = require('./effects.js').Effects;
const util = require('util');
const move = require('./commands').Commands.move;
const CommandUtil = require('./command_util').CommandUtil;

const l10n_dir = __dirname + '/../l10n/skills/';
let l10ncache = {};

/**
 * Localization helper
 * @return string
 */
const L = function(locale, cls, key /*, args... */ ) {
  var l10nFile = l10n_dir + cls + '.yml';
  var l10n = l10ncache[cls + locale] || require('./l10n')(l10nFile);
  l10n.setLocale(locale);
  return l10n.translate.apply(null, [].slice.call(arguments).slice(2));
};

// For activate functions:
// Command event passes in player, args, rooms, npcs, players.

exports.Skills = {

  dual: {
    id: "dual",
    cost: 2,
    name: "Dual Wield",
    description: "Your ability to use two (or more...) weapons at once.",
    usage: "Wield two one-handed weapons. Enjoy.",
    attribute: "quickness",
    type: "passive",
    activate: player => util.log(player.getName() + ' can dual wield.'),
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

  //// Cleverness-related skills.
  pick: {
    id: "pick",
    cost: 2,
    name: "Lockpick",
    description: "Your ability to illicitly open locked doors or containers.",
    usage: "`pick [exit]`",
    attribute: "cleverness",
    type: "active",
    activate: (player, target, rooms, npcs, players) => {
      if (target) {
        const room = rooms.getAt(player.getLocation());
        const exits = room.getExits();
        const name = player.getName();
        const possibleTargets = exits
          .filter(e => e.direction.indexOf(target.toLowerCase()) > -1);

        util.log(name + ' is trying to pick a lock...');

        if (possibleTargets && possibleTargets.length === 1) {
          const exit = possibleTargets[0];
          const isDoor = exit.hasOwnProperty('door');
          const isLocked = isDoor && exit.door.locked;

          if (isLocked) {
            player.say("<yellow>You attempt to unlock the door...</yellow>");
            const lockpicking = player.getSkills('pick') + player.getAttribute('cleverness');
            const challenge = parseInt(exit.door.difficulty || 10, 10);
            const getExitDesc = locale => rooms.getAt(exit.location).getTitle(locale);

            if (lockpicking > challenge){
              player.say("<bold><cyan>You unlock the door!<cyan></bold>");
              players.eachIf(
                p => CommandUtil.inSameRoom(player, p),
                p => p.say(name + ' swiftly picks the lock to ' + getExitDesc(p.getLocale()) + '.')
              );
              exit.door.locked = false;
              move(exit, player, true);
            } else {
              util.log(name + " fails to pick lock.");
              player.say("<red>You fail to unlock the door.</red>");
              players.eachIf(
                p => CommandUtil.inSameRoom(player, p),
                p => p.say(name + ' tries to unlock the door to ' + getExitDesc(p.getLocale()) +', but fails to pick it.')
              );
              return;
            }
          } else if (isDoor) {
            player.say("That door is not locked.");
            return;
          } else {
            player.say("There is no door in that direction.");
            return;
          }
        } else if (possibleTarget.length) {
          player.say("Which door's lock do you want to pick?");
          return;
        } else {
          player.say("There doesn't seem to be an exit in that direction, much less a lock to pick.");
          return;
        }
      } else {
        player.say("Which door's lock do you want to pick?");
        return;
      }
    },
  }
};
