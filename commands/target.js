'use strict';
const l10nFile = __dirname + '/../l10n/commands/target.yml';
const l10n = require('../src/l10n')(l10nFile);
const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {
    const targets = {
      torso: ['chest', 'body', 'arms', 'stomach', 'gut', 'belly', 'back'],
      head: ['face', 'eyes', 'mouth'],
      hands: ['hand'],
      feet: ['foot'],
      legs: ['leg']
    };

    args = args.toLowerCase().trim();

    if (args) {
      if (args in targets) {
        setTarget(args);
        return;
      } else {
        for (let targetable in targets) {
          const found = targets[targetable].indexOf(args) > -1;
          if (found) {
            setTarget(targetable);
            return;
          }
        }
      }
    }

    player.sayL10n(l10n, 'NO_TARGET', player.getPreference('target'));
    return;

    function setTarget(target) {
      player.setPreference('target', target);
      player.sayL10n(l10n, "TARGET_SET", target);
    }

  }
};
