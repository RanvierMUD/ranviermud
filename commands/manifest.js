'use strict';
const CommandUtil = require('../src/command_util').CommandUtil;
const Feats = require('../src/feats').Feats;
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

//TODO: Extract into command_util.js
/**
 * Does the player meet the prereqs for the feat, including cost?
 * @param  Player
 * @param  Feat
 * @return  bool True if they meet all conditions and can afford the feat.
 */
function meetsPrerequisites(player, feat) {
  if (!feat.prereqs && !feat.cost) { return true; }
  const attributes = player.getAttributes();

  for (let attr in feat.prereqs || {}) {
    let req = feat.prereqs[attr];
    let stat = attributes[attr];

    let meets = req <= stat;
    util.log(player.getName() + '\'s ' + attr + ': ' + stat + ' vs. ' + req);

    if (!meets) { return false; }
  }

  const isAffordable = feat.cost && attributes.mutagens >= feat.cost;
  return isAffordable;
}
