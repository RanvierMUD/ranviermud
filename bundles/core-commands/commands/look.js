'use strict';
const util  = require('util');

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    command : (state) => (args, player) => {
      if (!player.room) {
        util.log(player.getName() + ' is in limbo.');
        return Broadcast.sayAt(player, 'You are in a deep, dark void.');
      }

      let room = player.room;

      // Render the room
      Broadcast.sayAt(player, room.title);
      Broadcast.sayAt(player, room.description, 80);
      Broadcast.sayAt(player, '');

      // show all players
      room.players.forEach(otherPlayer => {
        if (otherPlayer === player) {
          return;
        }

        Broadcast.sayAt(player, '[Player] ' + otherPlayer.name);
      });

      // show all the items in the rom
      room.items.forEach(item => {
        Broadcast.sayAt(player, `<magenta>[Item] ${item.roomDesc}</magenta>`);
      });

      room.npcs.forEach(npc => {
        Broadcast.sayAt(player, '[NPC] ' + npc.name);
      });

      Broadcast.at(player, '[<yellow><bold>Exits</yellow></bold>: ');
      Broadcast.at(player, Array.from(room.exits).map(ex => ex.direction).join(' '));
      Broadcast.sayAt(player, ']');
      Broadcast.sayAt(player, '');
    }
  };
};
