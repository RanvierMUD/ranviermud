var otherPlayers = require('../../../src/command_util.js').CommandUtil.otherPlayerInRoom;

exports.listeners = {
  playerEnter: chooseRandomExit
};

function chooseRandomExit(room, rooms, player, players, npc) {
  return function(room, rooms, player, players, npc) {
    if (isCoinFlip()) {
      var exits = room.getExits();
      var chosen = getRandomFromArr(exits);
      if (!chosen.hasOwnProperty('mob_locked')) {
        var uid = npc.getUuid();
        var chosenRoom = rooms.getAt(chosen.location);

        try {
          npc.setRoom(chosen.location);
          chosenRoom.addNpc(uid);
          room.removeNpc(uid);

          player.say(npc.getShortDesc(player.getLocale()) + getLeaveMessage(
            player, chosenRoom));

          players.eachIf(
            otherPlayers.bind(
              null, player),
            function(p) {
              p.say(npc.getShortDesc(
                p.getLocale()) + getLeaveMessage(p, chosenRoom))
            });
        } catch(e) {
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

//TODO: Candidates for utilification.

function isCoinFlip() {
  return Math.round(Math.random());
}

function getRandomFromArr(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
