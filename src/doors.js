//TODO: Implement helper functions for:
// open/close, lock/unlock, and other player and NPC interactions with doors.

'use strict';
const util = require('util');

const CommandUtil = require('./command_util').CommandUtil;

/*
 * Handy little util functions.
 */
const has = (collection, thing) => collection.indexOf(thing) !== -1;

const findExit = (room, dir) => room.getExits()
  .filter(exit => has(exit.direction, dir));

const updateDestination = (player, dest, callback) => dest
  .getExits()
  .filter(exit => exit.location === player.getLocation())
  .forEach(callback);


const changeDoorLockState = isLocked => exit => exit.door.locked = isLocked;
const lockDoor = changeDoorLockState(true);
const unlockDoor = changeDoorLockState(false);


exports.Doors = {
  has,       updateDestination,
  findExit,  openOrClose,
  lockDoor,  unlockDoor,
};

function openOrClose(verb, args, player, players, rooms) {

  const isOpen = verb === 'open';

  player.emit('action', 0);

  if (player.isInCombat()) {
    player.say('You are too busy for that right now.');
    return;
  }

  args = args.toLowerCase().split(' ');

  if (!args) {
    return player.say("Which door do you want to " + verb + "?");
  }
  const room  = rooms.getAt(player.getLocation());
  const dir   = args[0];
  const exits = findExit(room, dir);

  if (exits.length !== 1) {
    return player.say('Be more specific...');
  }

  const exit = exits[0];

  if (!exit.door) {
    return player.say('There is no door.');
  }

  if (exit.door.open === isOpen) {
    const pastTense = isOpen ? 'opened' : 'closed';
    return player.say('That door is already ' + pastTense +'.');
  }

  const dest = rooms.getAt(exit.location);

  const srcTitle  = room.getTitle('en');
  const destTitle = dest.getTitle('en');

  player.say('You ' + verb + ' the door to ' + destTitle + '.');
  exit.door.open = isOpen;

  updateDestination(player, dest,
    exit => {
      exit.door.open = isOpen;

      const nounPhrase = isOpen ? 'swings open' : 'slams shut';
      players.eachIf(
        p => p.getLocation() === dest.getLocation(),
        p => p.say('The door to ' + srcTitle + ' ' + nounPhrase + '.'));
    });

  players.eachIf(
    p => CommandUtil.inSameRoom(p, player),
    p => p.say(player.getName() + ' ' + verb + 's the door to ' + dest + '.'));

}

function useKey(verb, args, player, players, rooms) {

  const isLocking = verb === 'lock';

  player.emit('action');

  if (player.isInCombat()) {
    return player.say('You are too busy for that right now.');
  }

  args = args.toLowerCase().split(' ');

  if (!args) {
    return player.say("Which door do you want to " + verb + "?");
  }

  const room  = rooms.getAt(player.getLocation());
  const dir   = args[0];
  const exits = findExit(room, dir);

  if (exits.length !== 1) {
    return player.say('Be more specific...');
  }

  const exit = exits[0];

  if (!exit.door) {
    return player.say('There is no door.');
  }

  if (exit.door.open === true && isLocking) {
    player.say('You close the door.');
    exit.door.open = false;
  }

  if (exit.door.locked === isLocking) {
    return player.say('That door is already ' + verb + 'ed.');
  }

  const key = CommandUtil.findItemInInventory(exit.door.key, player, true);

  if (!key) {
    return player.say('You are missing the key.');
  }

  const dest       = rooms.getAt(exit.location);
  const srcTitle   = room.getTitle('en');
  const destTitle  = dest.getTitle('en');

  player.say('You ' + verb + ' the door.');
  exit.door.locked = isLocking;

  const lockOrUnlock = isLocking ? lockDoor : unlockDoor;
  updateDestination(player, dest, lockOrUnlock);

  players.eachIf(
    p => CommandUtil.inSameRoom(p, player),
    p => p.say(player.getName() + ' pulls out a key and ' + verb + 's the door to ' + destTitle + '.'));

  players.eachIf(
    p => p.getLocation() === exit.location,
    p => p.say('You hear a click from the direction of ' + srcTitle + '.'));
}
