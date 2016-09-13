'use strict';
const CommandUtil = require('../src/command_util').CommandUtil;
const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) => {
    return (args, player) => {
        const room = rooms.getAt(player.getLocation());
        const npc = CommandUtil.findNpcInRoom(npcs, args, room, player, true);

        if (!npc) {
            player.say('They are not here.');
            return;
        }

        if (npc.isInCombat() === player) {
          player.say('Perhaps you should have tried that before attacking them?');
          return;
        }

        if (npc.isInCombat()) {
          player.say('They are a bit too busy for etiquette!');
          return;
        }

        if (player.isInCombat()) {
          player.say('You are too busy for manners right now.');
          return;
        }

        if (!player.hasMet(npc, true)) {
          player.say('You introduce yourself to ' + npc.getShortDesc('en') + ' and they introduce themselves as ' + npc.getName() + '.');
        }
        npc.emit('introduction', player, players, room);

    };
};
