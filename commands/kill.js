'use strict';
const CommandUtil = require('../src/command_util').CommandUtil;
const l10n_file = __dirname + '/../l10n/commands/kill.yml';
const l10n = require('../src/l10n')(l10n_file);
const util = require('util');
exports.command = (rooms, items, players, npcs, Commands) => {
    return (args, player) => {
        const room = rooms.getAt(player.getLocation());
        const npc = CommandUtil.findNpcInRoom(npcs, args, room, player, true);

        if (!npc) {
            player.sayL10n(l10n, 'TARGET_NOT_FOUND');
            return;
        }
        if (!npc.listeners('combat').length) {
            player.sayL10n(l10n, 'KILL_PACIFIST');
            return;
        }

        util.log(player.getName() + ' is on the offensive...');
        npc.emit('combat', player, room, players, npcs, rooms, cleanup);

        function cleanup(success) {
            // cleanup here...
        };
    };
};
