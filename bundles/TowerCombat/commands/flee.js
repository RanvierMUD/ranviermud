'use strict';

const { Random } = require('rando-js');
const { Broadcast } = require('ranvier');
const { CommandParser } = require('../..//bundle-example-lib/lib/CommandParser');
const say = Broadcast.sayAt;

module.exports = {
  usage: 'flee [direction]',
  command: state => (direction, player) => {
    if (!player.isInCombat()) {
      return say(player, "You jump at the sight of your own shadow.");
    }


    let roomExit = null;
    if (direction) {
      roomExit = CommandParser.canGo(player, direction);
    } else {
      roomExit = Random.fromArray(player.room.getExits());
    }

    const randomRoom = state.RoomManager.getRoom(roomExit.roomId);

    if (!randomRoom) {
      say(player, "You can't find anywhere to run!");
      return;
    }


    const door = player.room.getDoor(randomRoom) || randomRoom.getDoor(player.room);
    if (randomRoom && door && (door.locked || door.closed)) {
      say(player, "In your panic you run into a closed door!");
      return;
    }

    say(player, "You cowardly flee from the battle!");
    player.removeFromCombat();
    player.emit('move', { roomExit });
  }
};
