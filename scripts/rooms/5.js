'use strict';
const CommandUtil = require('../../src/command_util')
  .CommandUtil;
const Time = require('../../src/time').Time;

const l10nFile = __dirname + '/../../l10n/scripts/rooms/5.js.yml';
const l10n = require('../../src/l10n')(l10nFile);
const examiner = require('../../src/examine').examine;

exports.listeners = {

  examine: l10n => {
    return (args, player, players) => {

      const config = {
        poi: [
          "windows",
          "window",
          "curtains",
          "outside",
          "outdoors"
        ],
        found: lookOutside,
        nothingFound: nothingFound
      };

      return examiner(args, player, players, config);

      function nothingFound() {
        player.sayL10n(l10n, 'NOT_FOUND');
        players.eachIf(p => CommandUtil.inSameRoom(player, p),
          p => { p.sayL10n(l10n, 'OTHER_NOT_FOUND', player.getName()); });
      }


      function lookOutside() {
        if (Time.isDay()) {
          player.sayL10n(l10n, 'WALL');
          players.eachIf(p => CommandUtil.inSameRoom(player, p),
            p => { p.sayL10n(l10n, 'OTHER_LOOKING', player.getName()); });
        } else
          player.sayL10n(l10n, 'DARKNESS');
      }
    }
  }

};
