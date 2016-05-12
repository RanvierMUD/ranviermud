'use strict';
const Feats = require('../src/feats').Feats;
const meetsPrerequisites = require('../src/feats').meetsPrerequisites;
const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {
    const playerFeats = player.getFeats() || {};

    let ownFeats = [];
    let availableFeats = [];

    for (let feat in Feats) {
      const available = meetsPrerequisites(player, Feats[feat]);
      const owned = Feats[feat].name in playerFeats;

      if (available && !owned) { availableFeats.push(Feats[feat]); }
      if (owned) { ownFeats.push(Feats[feat]); }
    }

    if (!availableFeats.length && !ownFeats.length) {
      player.say('You are perfectly normal.');
      return;
    }

    player.say('')

    if (ownFeats.length) {
      player.say('<bold>Your mutations:</bold>');
      player.say('')
      ownFeats.forEach(feat => {
        player.say('<cyan>' + feat.name + '</cyan>');
        player.say('<yellow>' + feat.description + '</yellow>');
        player.say('');
      });
    }

    if (availableFeats.length) {
      player.say('<bold><red>Potential mutations:</red></bold>');
      player.say('')
      ownFeats.forEach(feat => {
        player.say('<magenta><bold>   ' + feat.name + '</bold></magenta>');
        player.say('<yellow>' + feat.description + '</yellow>');
        player.say('<yellow>Type: ' + feat.type.toUpperCase() + '</yellow>');
        player.say('');
      });
    }



  };
};
