'use strict';

const util = require('util');

const l10nFile = __dirname + '/../l10n/commands/stance.yml';
const l10n = require('../src/l10n')(l10nFile);
const CommandUtil = require('../src/command_util').CommandUtil;
const _ = require('../src/helpers');

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {

    const stance = _.firstWord(args);

    const stances = {
      'cautious': {
        speed:   speed   => speed   * 2,
        damage:  damage  => damage  * .5,
        defense: defense => defense * 1.5,
        toHit:   toHit   => toHit   * .75
      },
      'normal': {},
      'berserk': {},
      'precise': {},
    };

    if (stance && stance in stances) {
      const chosenStance = stances[stance];
      const hasMods = _.hasKeys(chosenStance);

      if (hasMods) {
        player.setPreference('stance', stance);
        player.sayL10n(l10n, 'STANCE_SET', stance);

        for (const modifier in chosenStance) {
          const addMod = player.combat.addMod(modifier + 'Mods');
          addMod({
            name:   stance,
            effect: chosenStance(modifier)
          })
        }

        for (const otherStance in stances) {
          if (otherStance !== stance) {
            player.combat.removeAllMods(otherStance);
          }
        }

        return players.eachIf(
          p => CommandUtil.inSameRoom(player, p),
          p => p.sayL10n('OTHER_STANCE', player.getName(), stance));
      } else {

      }
    }


    player.sayL10n(l10n, 'STANCE', player.getPreference('stance'));
  }
};
