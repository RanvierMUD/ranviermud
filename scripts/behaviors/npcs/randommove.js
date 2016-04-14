'use strict';
var CommandUtil = require('../../../src/command_util.js')
  .CommandUtil;


exports.listeners = {
  tick: chooseRandomExit
};

function chooseRandomExit(room, rooms, player, players, npc) {
  return function(room, rooms, player, players, npc) {
    if (CommandUtil.isCoinFlip()) {
      var exits = room.getExits();
      var chosen = CommandUtil.getRandomFromArr(exits);
      if (!chosen.hasOwnProperty('mob_locked')) {
        var uid = npc.getUuid();
        var chosenRoom = rooms.getAt(chosen.location);

        try {
          npc.setRoom(chosen.location);
          chosenRoom.addNpc(uid);
          room.removeNpc(uid);

          if (player){
            let locale = player.getLocale();
            let msg = getLeaveMessage(player, chosenRoom);
            player.say(npc.getShortDesc(locale) + msg);
          }

          players.eachIf(
            CommandUtil.otherPlayerInRoom.bind(null, player),
            p => {
              p.say(npc.getShortDesc(p.getLocale()) + getLeaveMessage(p, chosenRoom))
            });
        } catch (e) {
          console.log("EXCEPTION: ", e);
          console.log("NPC: ", npc);
        }
      }
    }
  }
}

function getLeaveMessage(player, chosenRoom) {
  if (chosenRoom && chosenRoom.title)
    return ' leaves for ' + chosenRoom.title[player.getLocale()] + '.';
  return ' leaves.'
}
