'use strict';
const CommandUtil = require('../src/command_util').CommandUtil;
const l10nFile = __dirname + '/../l10n/commands/kill.yml';
const _ = require('../src/helpers');
const l10n = require('../src/l10n')(l10nFile);
const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) => {
    return (args, player) => {
        const room = rooms.getAt(player.getLocation());
        const npc = CommandUtil.findNpcInRoom(npcs, args, room, player, true);

        if (!npc) {
            return player.warn(`Kill ${args}? If you can find them, maybe.`);
        }

        if (npc.isPacifist()) {
            return player.warn(`${npc.getShortDesc()} radiates a calming aura.`);
        }

        util.log(player.getName() + ' is on the offensive...');

        const fightingPlayer = _.has(npc.getInCombat(), player);

        if (fightingPlayer) {
          return player.say(`You are already fighting that ${npc.getShortDesc()}!`);
        } else if (npc.isInCombat()) {
          return player.say('That ${npc.getShortDesc()} is busy fighting someone else, no fair!');
        }

        npc.emit('combat', player, room, players, npcs, rooms, items, cleanup);

        function cleanup(success) {
            // cleanup here...
        }
    };
};
