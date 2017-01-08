'use strict';
const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) => {
    return (args, player) => {
        const playerName = player.getName();

        if (player.isInCombat()) {
            util.log(playerName + ' tried to quit during combat.');
            return player.say("You're fighting for your life, you can't leave now!");
        }

        player.save(() => {
            players.removePlayer(player, true)
            util.log(playerName + ' has quit.');
            player.emit('quit');
        });
    };
};
