'use strict';

module.exports = (srcPath) => {
  const B = require(srcPath + 'Broadcast');
  const Parser = require(srcPath + 'CommandParser').CommandParser;
  const ItemType = require(srcPath + 'ItemType');
  const Logger = require(srcPath + 'Logger');

  return {
    usage: 'сказать <имя> <сообщение>',
	aliases: [ 'сказать' ],
    command : (state) => (args, player) => {
      if (!args.length) {
        return B.sayAt(player, 'С кем ты пытаешься поговорить?');
      }

      if (!player.room) {
        return B.sayAt(player, 'Ты НИГДЕ, ты не можешь говорить.');
      }

      let [ npcSearch, ...messageParts ] = args.split(' ');
      let message = messageParts.join(' ').trim();

      // allow for `talk to npc message here`
      if (npcSearch === 'to' && messageParts.length > 1) {
        npcSearch = messageParts[0];
        message = messageParts.slice(1).join(' ');
      }

      if (!npcSearch) {
        return B.sayAt(player, 'С кем ты пытаешься поговорить?');
      }

      if (!message.length) {
        return B.sayAt(player, 'Что ты хочешь сказать??');
      }

      const npc = Parser.parseDot(npcSearch, player.room.npcs);
      if (!npc) {
        return B.sayAt(player, "Ты не видешь его здесь.");
      }

      B.sayAt(player, `<b><cyan>Ты сказал ${npc.name}, '${message}'</cyan></b>`);
      if (!npc.hasBehavior('ranvier-sentient')) {
        return B.sayAt(player, "Не похоже чтобы тебя поняли.");
      }

      npc.emit('conversation', player, message);
    }
  };
};
