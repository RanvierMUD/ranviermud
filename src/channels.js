'use strict';
const newLine = new RegExp('\\n');

exports.Channels = {
  say: {
    name: 'say',
    description: 'Talk to those around you',
    use: (args, player, players, rooms, npcs) => {
      args = args.replace(newLine, '');
      players.broadcastAt("<bold><cyan>" + player.getName() + "</cyan></bold> says '" + args + "'", player);
      npcs.eachIf(
        npc => npc.getLocation() === player.getLocation(),
        npc => npc.emit('playerSay', player, players, rooms, npcs, args)
      );
    }
  },

  chat: {
    name: 'chat',
    description: 'Talk to everyone online',
    use: (args, player, players) => {
      args = args.replace(newLine, '');
      players.broadcast("<bold><magenta>[chat] " + player.getName() + ": " + args + "</magenta></bold>", player);
      players.eachExcept(player, p => p.prompt());
    }
  },

  yell: {
    name: 'yell',
    description: 'Yell to everyone in the same area',
    use: (args, player, players, rooms, npcs) => {
      args = args.replace(newLine, '').toUpperCase();

      const playerRoom = rooms.getAt(player.getLocation());
      const playerArea = playerRoom.getArea();

      const getAreaOf = entity => rooms.getAt(entity.getLocation()).getArea();

      players.broadcastIf(
        "<bold><red>" + player.getName() + " yells '" + args + "!'</red></bold>",
        p => {
          const otherPlayerRoom = rooms.getAt(p.getLocation());
          const otherPlayerArea = otherPlayerRoom.getArea();

          const sameArea = playerArea === otherPlayerArea;
          const notSameRoom = playerRoom !== otherPlayerRoom;
          const notSamePlayer = player !== p;

          return sameArea && notSameRoom && notSamePlayer;
        }
      );
      player.say("<bold><red>You yell, \""+args+"!\"</red></bold>");

      npcs.eachIf(
        npc => getAreaOf(npc) === playerArea,
        npc => npc.emit('playerYell', player, players, rooms, npcs, args)
      );
    }
  },

  //TODO: Modify tell to work with NPCs in same room.
  tell: {
    name: 'tell',
    description: 'Talk to a specific person',
    use: (args, player, players, rooms, npcs) => {
      const nameEnd = args.indexOf(" ");
      const target = args.substring(0, nameEnd).toLowerCase();
      const text = args.substring(nameEnd /* to end of args */);
      const exists = players.some(p => p.getName().toLowerCase() === target);
      const name = player.getName();

      if (exists) {
        players.broadcastIf(
          "<bold><magenta>" + player.getName() + " told you: " + text + "</magenta></bold>",
          p => p.getName().toLowerCase() === target);
        player.say("<bold><magenta>You told " + target + ": " + text + "</magenta></bold>", player);
      } else {
        player.say("<bold><magenta>" + target + " is not logged in.</magenta></bold>", player);
      }
      players.eachIf( p.getName().toLowerCase() === target, p => p.prompt());
    }
  }
};
