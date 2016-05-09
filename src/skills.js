'use strict';
const Effects = require('./effects.js').Effects;
const util = require('util');
const move = require('./commands').Commands.move;


const l10n_dir = __dirname + '/../l10n/skills/';
let l10ncache = {};
/**
 * Localization helper
 * @return string
 */

const L = function(locale, cls, key /*, args... */ ) {
  var l10n_file = l10n_dir + cls + '.yml';
  var l10n = l10ncache[cls + locale] || require('./l10n')(l10n_file);
  l10n.setLocale(locale);
  return l10n.translate.apply(null, [].slice.call(arguments).slice(2));
};

// For activate functions:
// Command event passes in player, args, rooms, npcs.
// TODO: Find a way to broadcast skill use to players in room.

exports.Skills = {

  //// Cleverness-related skills.
  pick: {
    cost: 2,
    name: "Lockpick",
    description: "Your ability to pick or force open locked doors or containers.",
    attribute: "cleverness",
    activate: (player, target, rooms, npcs) => {
      if (target) {
        util.log(player.getName() + ' is trying to pick a lock...');
        const room = rooms.getAt(player.getLocation());
        const exits = room.getExits();
        const possibleTargets = exits
          .filter(e => e.direction.indexOf(target.toLowerCase()) > -1);

        if (possibleTargets && possibleTargets.length === 1) {
          const exit = possibleTargets[0];
          const isDoor = exit.hasOwnProperty('door');
          const isLocked = isDoor && exit.door.locked;

          if (isLocked) {
            player.say("<yellow>You attempt to unlock the door...</yellow>");
            const lockpicking = player.getSkills('pick');
            const challenge = parseInt(exit.door.difficulty || 10, 10);

            if (lockpicking > challenge){
              player.say("<bold><cyan>You unlock the door!<cyan></bold>");
              exit.door.locked = false;
              move(exit, player, true);
            } else {
              util.log(player.getName() + " fails to pick lock.");
              player.say("<red>You fail to unlock the door.</red>");
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
