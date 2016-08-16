'use strict';
const CommandUtil = require('../../src/command_util')
  .CommandUtil;
const Random = require('../../src/random').Random;
const examiner = require('../../src/examine').examine;

exports.listeners = {

  examine: l10n => {
    return (args, player, players) => {

      const config = {
        poi: [
          'railing',
          'bent',
          'banister',
          'guardrail'
        ],
        found: findRailing.bind(null, player, players),
      };

      return examiner(args, player, players, config);

      function findRailing(player, players) {
        let alreadyFound = player.hasExplored('observed_balcony_serpent');

        if (!alreadyFound) {
          player.emit('experience', 15, 'the brute strength you may be up against');
        }

        player.say('Upon close examination, you see what appear to be <red>wide scratches</red> in the finishing where the railing is bent.');
        player.say('They resemble claw marks. It looks like the iron railing was bent by... something.');
        players.eachIf(
          p => CommandUtil.inSameRoom(player, p),
          p => {
            p.say(player.getName() + ' closely examines the balcony\'s guardrail');
          });
          
        }
      }
    };
  },
};
