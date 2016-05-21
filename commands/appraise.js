'use strict';
const CommandUtil = require('../src/command_util').CommandUtil;
const util = require('util');
const l10nFile = __dirname + '/../l10n/commands/appraise.yml';
const l10n = require('../src/l10n')(l10nFile);

exports.command = (rooms, items, players, npcs, Commands) => {

  return (args, player) => {

    const room = rooms.getAt(player.getLocation());
    const target = CommandUtil.findNpcInRoom(npcs, args, room, player, true);

    if (!target) {
      player.sayL10n(l10n, 'TARGET_NOT_FOUND');
      return;
    }

    const locale = player.getLocale() || 'en';
    const targetLevel = target.getAttribute('level') || null;
    const playerLevel = player.getAttribute('level') || null;
    const targetName = target.getShortDesc(locale) || null;

    if (targetLevel && playerLevel && targetName) {
      util.log(player.getName() + ' is considering ' + targetName + '.');
      player.sayL10n(l10n, getRelativeLevel(playerLevel, targetLevel), targetName);
      return;
    }

    player.sayL10n(l10n, 'MISSING_INFORMATION');
    return;

  }

  function getRelativeLevel(playerLevel, targetLevel) {
    const difference = playerLevel - targetLevel;
    if (difference < -3) {
      return 'TARGET_MUCH_STRONGER';
    } else if (difference < -1) {
      return 'TARGET_STRONGER';
    } else if (difference > 3) {
      return 'TARGET_MUCH_WEAKER';
    } else if (difference > 1) {
      return 'TARGET_WEAKER';
    } else if (difference < 1) {
      return 'TARGET_SAME_LEVEL';
    } else return 'MISSING_INFORMATION';
  }

};
