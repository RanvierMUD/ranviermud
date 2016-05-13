'use strict';
const Feats = require('../src/feats').Feats;
const meetsPrerequisites = require('../src/feats').meetsPrerequisites;
const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {
    if (args) {
      const featToManifest = args.split(' ')[0].toLowerCase();

      if (featToManifest in player.getFeats()) {
        player.say('You already have manifested ' + featToManifest + '.');
        return
      }

      if (featToManifest in Feats) {
        const feat = Feats[featToManifest];

        if (meetsPrerequisites(player, feat)) {
          player.say('You manifest ' + feat.name.toLowerCase() + '.');
          util.log(player.getName() + ' manifests ' + feat.name);

          purchaseFeat(player, feat);
          return;
        } else {
          player.say('You are not yet powerful enough to manifest ' + featToManifest + '.');
          return;
        }
      }
    }

    player.say('Manifest what?');

  }
}

function purchaseFeat(player, feat) {
  const originalMutagens = player.getAttribute('mutagens');
  player.setAttribute('mutagens', originalMutagens - feat.cost);

  player.gainFeat(feat);
  if (feat.type === 'passive') { feat.activate(player); }
}
