'use strict';

const Doors = require('../src/doors').Doors;
const CommandUtil = require('../src/command_util').CommandUtil;

//TODO: Unit test this.
module.exports = function attemptLockpick(player, players, rooms, exit) {
  const isDoor = Doors.isDoor(exit);
  const isLocked = isDoor && Doors.isLocked(exit);
  const isClosed = !Doors.isOpen(exit);

  if (isLocked && isClosed) {
    attemptPick();
  } else {
    cannotPick(isDoor, isClosed);
  }

  function attemptPick() {
    player.say("<yellow>You attempt to unlock the door...</yellow>");
    const lockpicking = player.getSkills('pick') + player.getAttribute('cleverness');
    const challenge = Doors.getLockDifficulty(exit);
    const getExitDesc = locale => rooms.getAt(exit.location).getTitle(locale);

    if (lockpicking > challenge) {
      player.say("<bold><cyan>You unlock the door!<cyan></bold>");
      players.eachIf(
        p => CommandUtil.inSameRoom(player, p),
        p => p.say(name + ' swiftly picks the lock to ' + getExitDesc(p.getLocale()) + '.')
      );
      Doors.unlockDoor(exit);
    } else {
      util.log(name + " fails to pick lock.");
      player.say("<red>You fail to unlock the door.</red>");
      players.eachIf(
        p => CommandUtil.inSameRoom(player, p),
        p => p.say(name + ' tries to unlock the door to ' + getExitDesc(p.getLocale()) + ', but fails to pick it.')
      );
    }
  }

  function cannotPick(isDoor, isClosed) {
    if (isDoor && isClosed) {
      return player.say("That door is not locked.");
    } else if (isDoor) {
      return player.say("That door is wide open already!");
    } else {
      return player.say("There is no door in that direction.");
    }
  }

}
