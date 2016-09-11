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
  return () =>
    (room, rooms, player, players, npc, npcs) => {

      if (npc.isInCombat()) { return; }

      chance = chance || 5; // Roll to beat on 1d100
      if (chance > Random.inRange(1, 100)) {
        const exits  = room.getExits();
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
              const locale = 'en';
              const msg = getLeaveMessage(player, chosenRoom);
              player.say(npc.getShortDesc(locale) + msg);
            }

            const dest = chosenRoom.getTitle('en');
            npc.emit('npcLeave', room, rooms, players, npcs, dest);

            npc.setRoom(chosen.location);
            room.removeNpc(uid);
            chosenRoom.addNpc(uid);

            const src = room.getTitle('en');
            setTimeout(npc.emit.bind(npc, 'npcEnter', room, rooms, players, npcs, src), 555);

          } catch (e) {
            console.log("EXCEPTION: ", e);
            console.log("NPC: ", npc);
          }
        }
      }
    }
}
