'use strict';
const CommandUtil = require('./command_util.js')
  .CommandUtil;
const Random = require('./random.js').Random;

module.exports = {
    chooseRandomExit: _chooseRandomExit,
  };

function _chooseRandomExit(room, rooms, player, players, npc) {
  return (room, rooms, player, players, npc) => {
    if (Random.coinFlip()) {
      let exits = room.getExits();
      let chosen = Random.fromArray(exits);
      if (!chosen.hasOwnProperty('mob_locked')) {
        let uid = npc.getUuid();
        let chosenRoom = rooms.getAt(chosen.location);

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
            CommandUtil.otherPlayerInRoom.bind(null, player || npc),
            p => {
              let locale = p.getLocale();
              let msg = getLeaveMessage(p, chosenRoom);
              p.say(npc.getShortDesc(locale) + msg);
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
