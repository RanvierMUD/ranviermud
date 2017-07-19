'use strict';

module.exports = (srcPath) => {
  const B = require(srcPath + 'Broadcast');
  const Parser = require(srcPath + 'CommandParser').CommandParser;
  const ItemType = require(srcPath + 'ItemType');
  const Logger = require(srcPath + 'Logger');

  return {
    usage: 'talk <npc> <message>',
    command : (state) => (args, player) => {
      if (!args.length) {
        return B.sayAt(player, 'Who are you trying to talk to?');
      }

      if (!player.room) {
        return B.sayAt(player, 'You are floating in the nether, you cannot speak.');
      }

      let [ npcSearch, ...messageParts ] = args.split(' ');
      let message = messageParts.join(' ').trim();

      // allow for `talk to npc message here`
      if (npcSearch === 'to' && messageParts.length > 1) {
        npcSearch = messageParts[0];
        message = messageParts.slice(1).join(' ');
      }

      if (!npcSearch) {
        return B.sayAt(player, 'Who are you trying to talk to?');
      }

      if (!message.length) {
        return B.sayAt(player, 'What did you want to say?');
      }

      const npc = Parser.parseDot(npcSearch, player.room.npcs);
      if (!npc) {
        return B.sayAt(player, "You don't see them here.");
      }

      B.sayAt(player, `<b><cyan>You say to ${npc.name}, '${message}'</cyan></b>`);
      if (!npc.hasBehavior('ranvier-sentient')) {
        return B.sayAt(player, "They don't seem to understand you.");
      }

      npc.emit('conversation', player, message);
    }
  };
};
