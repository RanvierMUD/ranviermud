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


        npc.setRoom(chosen.location);
        chosenRoom.addNpc(uid);
        room.removeNpc(uid);

        player.say(npc.getShortDesc(player.getLocale()) + getLeaveMessage(
          player, chosen));

        players.eachIf(
          otherPlayers.bind(
            null, player),
          function(p) {
            p.say(npc.getShortDesc(
              p.getLocale()) + getLeaveMessage(p, chosen))
          });
      }
    }
  }
}

//TODO: Candidates for utilification.
function getLeaveMessage(player, chosen) {
  return chosen.leave_message[
    player.getLocale()] || ' leaves.';
}

function isCoinFlip() {
  return Math.round(Math.random());
}

function getRandomFromArr(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}