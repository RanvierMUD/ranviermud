'use strict';
const Feats = require('../src/feats').Feats;
const CommandUtil = require('../src/command_util').CommandUtil;

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {
    const playerFeats = player.getFeats() || {};

    let ownFeats = [];
    let availableFeats = [];

    for (let feat of Feats) {
      const available = CommandUtil.meetsPrerequisites(player, Feats[feat]);
      const owned = Feats[feat].name in playerFeats;

      if (available && !owned) { availableFeats.push(Feats[feat]); }
      if (owned) { ownFeats.push(Feats[feat]); }
    }

    if (ownFeats.length) {
      player.say('<bold>Your mutations:</bold>');
      ownFeats.forEach(feat => {
        player.say('<blue>' + feat.name + '</blue>');
        player.say('<yellow>' + feat.description + '</yellow>');
        player.say(feat.type);
        player.say('');
      });
    }

    if (availableFeats.length) {
      player.say('<bold><red>Available mutations:</red></bold>');
      ownFeats.forEach(feat => {
        player.say('<cyan>' + feat.name + '</cyan>');
        player.say('<yellow>' + feat.description + '</yellow>');
        player.say(feat.type);
        player.say('');
      });
    }

    if (!availableFeats.length && !ownFeats.length) {
      player.say('You are perfectly normal.');
    }

  };
};
