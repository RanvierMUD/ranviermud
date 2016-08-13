'use strict';
const CommandUtil = require('../../src/command_util')
  .CommandUtil;
const l10nFile = __dirname + '/../../l10n/scripts/rooms/11.js.yml';
const l10n = require('../../src/l10n')(l10nFile);
const examiner = require('../../src/examine').examine;

exports.listeners = {

  examine: l10n => {
    return (args, player, players) => {
      const config = {
        poi: [
          'ground',
          'floor',
          'stains',
          'blood',
          'rust'
        ],
        found: seeDisturbance.bind(null, player, players),
        check: player.spot.bind(null, 3, 1)
      }

      return examiner(args, player, players, config);
    };
  },
};

function seeDisturbance(player, players) {
  const alreadyFound = player.explore('noticed bloodstains in cage');

  if (!alreadyFound) {
    player.emit('experience', 100, 'the violent nature of humanity.');
  }

  const sanity = player.getAttribute('sanity') - 5;
  player.setAttribute('sanity', sanity);

  player.sayL10n(l10n, 'DISCOMFORT');
  players.eachIf(
    p => CommandUtil.inSameRoom(p, player),
    p => { p.sayL10n(l10n, 'OTHER_DISCOMFORT'); });
}
