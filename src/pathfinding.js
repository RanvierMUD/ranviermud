'use strict';
const CommandUtil = require('./command_util.js')
  .CommandUtil;
const Random = require('./random.js').Random;
const Doors  = require('./doors.js').Doors;
const util   = require('util');

module.exports = {
  chooseRandomExit,
};

function chooseRandomExit(chance) {
  return () => {
    return (room, rooms, player, players, npc) => {

      if (npc.isInCombat()) { return; }

      chance = chance || 10 // Roll to beat on 1d20

      if (chance < Random.roll()) {
        const exits = room.getExits();
        const chosen = Random.fromArray(exits);

        util.log(npc.getShortDesc('en') + " moves to room #" + chosen.location);

        const openDoor     = Doors.isOpen(chosen);
        const canOpenDoors = npc.hasType('humanoid');

        const canMove = (openDoor || canOpenDoors) && Doors.isNpcPassable(chosen);

        if (canMove) {
          const uid = npc.getUuid();
          const chosenRoom = rooms.getAt(chosen.location);

          try {
            if (player) {
              const locale = player.getLocale();
              const msg = getLeaveMessage(player, chosenRoom);
              player.say(npc.getShortDesc(locale) + msg);
            }

            const broadcastNpcMovement = getMsg => p => {
              const locale = p.getLocale();
              const msg    = getMsg(p, chosenRoom);
              p.say(npc.getShortDesc(locale) + msg);
            };

            const broadcastLeave = broadcastNpcMovement(getLeaveMessage);
            const broadcastEntry = broadcastNpcMovement(getEntryMessage);

            players.eachIf(
              p => CommandUtil.inSameRoom(player || npc, p),
              broadcastLeave);

            npc.setRoom(chosen.location);
            room.removeNpc(uid);
            chosenRoom.addNpc(uid);

            const npcInRoomWithPlayer = CommandUtil.inSameRoom.bind(null, npc);

            players.eachIf(
              npcInRoomWithPlayer,
              broadcastEntry);

          } catch (e) {
            console.log("EXCEPTION: ", e);
            console.log("NPC: ", npc);
          }
        }
      }
    }
  }
}

function getLeaveMessage(player, chosenRoom) {
  return chosenRoom && chosenRoom.title ?
    ' leaves for ' + chosenRoom.title[player.getLocale()] + '.' :
    ' leaves.';
}

//TODO: Custom entry messages for NPCs.
function getEntryMessage() {
  return ' enters.';
}
