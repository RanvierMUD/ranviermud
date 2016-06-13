'use strict';
const CommandUtil = require('./command_util.js')
  .CommandUtil;
const Random = require('./random.js').Random;
const util = require('util');

module.exports = {

  chooseRandomExit: _chooseRandomExit,

};

function _chooseRandomExit(chance) {
  return () => {
    return (room, rooms, player, players, npc) => {

      if (npc.isInCombat()) { return; }

      chance = chance || 10 // Roll to beat on 1d20

      if (chance < Random.roll()) {
        const exits = room.getExits();
        const chosen = Random.fromArray(exits);

        util.log(npc.getShortDesc('en') + " moves to " + chosen.location);

        const mobsAllowed = !chosen.hasOwnProperty('mob_locked');
        const openDoor = chosen.door && chosen.door.open === 'true';
        const canOpenDoors = npc.hasType('humanoid');
        const doorLocked = chosen.door && chosen.door.locked;

        const canMove = mobsAllowed && (openDoor || canOpenDoors) && !doorLocked;

        if (canMove) {
          const uid = npc.getUuid();
          const chosenRoom = rooms.getAt(chosen.location);

          try {
            if (player) {
              const locale = player.getLocale();
              const msg = getLeaveMessage(player, chosenRoom);
              player.say(npc.getShortDesc(locale) + msg);
            }

            players.eachIf(
              CommandUtil.inSameRoom.bind(null, player || npc),
              p => {
                const locale = p.getLocale();
                const msg = getLeaveMessage(p, chosenRoom);
                p.say(npc.getShortDesc(locale) + msg);
              });

            npc.setRoom(chosen.location);
            room.removeNpc(uid);
            chosenRoom.addNpc(uid);


            const npcInRoomWithPlayer = CommandUtil.inSameRoom.bind(null, npc);

            players.eachIf(npcInRoomWithPlayer,
              p => {
                const locale = p.getLocale();
                const msg = getEntryMessage();
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
}

function getLeaveMessage(player, chosenRoom) {
  if (chosenRoom && chosenRoom.title)
    return ' leaves for ' + chosenRoom.title[player.getLocale()] + '.';
  return ' leaves.'
}

function getEntryMessage() {
  return ' enters.';
}
