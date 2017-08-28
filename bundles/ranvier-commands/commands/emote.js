'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    usage: 'emote <message>',
    aliases: [':'],
    command: (state) => (args, player) => {
      const FIND_TARGETS_REGEXP = /~([^\s.,!"']+)/gi;
      const REPLACE_TARGETS_REGEXP = /~[^\s.,!"']+/;
      args = args.trim();

      if (!args.length) {
        return Broadcast.sayAt(player, 'Yes, but what do you want to emote?');
      }

      // Build an array of items matching the emote targets (specified by ~<target> in the emote.
      let execResult;
      let matchedTargets = [];
      while ((execResult = FIND_TARGETS_REGEXP.exec(args)) !== null) {
        let targetNameFromInput = execResult[1];
        const target = findTargetByName(player, targetNameFromInput);
        if (target === null) {
          return Broadcast.sayAt(player, `I can not seem to find ${targetNameFromInput}`);
        } else {
          matchedTargets.push(target);
        }
      }

      // Replace the initial emote message with the found targets and broadcast to the room.
      const emoteMessage = matchedTargets.reduce((string, target) => string.replace(REPLACE_TARGETS_REGEXP, target.name), `${player.name} ${args}.`);
      for (let presentPlayer of player.room.players) {
        if (presentPlayer === player) {
          Broadcast.sayAt(player, `You emote "${emoteMessage}"`);
        } else {
          Broadcast.sayAt(presentPlayer, emoteMessage.replace(presentPlayer.name, 'you'));
        }
      }
    }
  };

  function findTargetByName(player, thingName) {
    const findableThings = [...player.room.players.values(), ...player.equipment.values(), ...player.room.npcs.values(), ...player.room.items.values()];
    for (let thing of findableThings) {
      if (thing.name.toLowerCase().indexOf(thingName.toLowerCase()) !== -1) {
        return thing;
      }
    }
    return null;
  }
};
