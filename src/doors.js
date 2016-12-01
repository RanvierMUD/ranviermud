'use strict';

const util = require('util');
const _    = require('./helpers');
const CommandUtil = require('./command_util').CommandUtil;

/*
 * Door-related helper functions.
 */

// Returns an array of exits that match the provided direction string.
const findExit = (room, dir) => room.getExits()
  .filter(exit => exit.direction.includes(dir));

// Takes a callback to use on the destination room.
const updateDestination = (player, dest, callback) => dest
  .getExits()
  .filter(exit => exit.location === player.getLocation())
  .forEach(callback);

/* Dealing with locked/unlocked states */
const changeDoorLockState = isLocked => exit => exit.door.locked = isLocked;
const lockDoor   = changeDoorLockState(true);
const unlockDoor = changeDoorLockState(false);

const isLocked = exit => exit.door && exit.door.locked;
const defaultDifficulty = 5;
const getLockDifficulty = exit => parseInt(exit.door.difficulty || defaultDifficulty, 10);

/* Dealing with npc passage */
const isMobLocked   = exit => isDoor(exit) && exit.door.mob_locked && exit.door.mob_locked === true;
const isNpcPassable = exit => !(isMobLocked(exit) || isLocked(exit));

/* Dealing with open/closed states */
const isDoor = exit => exit && exit.hasOwnProperty('door');
const isOpen = exit => exit.door ? exit.door.open : true;

const useKeyToUnlock = useKey.bind(null, 'unlock');
const useKeyToLock   = useKey.bind(null, 'lock');

const openDoor  = openOrClose.bind(null, 'open');
const closeDoor = openOrClose.bind(null, 'close');

//TODO: Refactor to use the bound functions in external code.
exports.Doors = {
  updateDestination,
  useKeyToLock,
  useKeyToUnlock,
  getLockDifficulty,
  findExit,  openOrClose,
  lockDoor,  unlockDoor,
  useKey,    isMobLocked,
  isLocked,  isOpen,
  isDoor,    isNpcPassable,
  openDoor,  closeDoor,
};

/* useKey && openOrClose
 * both take a verb string along with args, player, players, rooms dependencies.
 * useKey verb:       'lock' | 'unlock'
 * openOrClose verb:  'open' | 'close'
 * This is because the code is more or less the same for each command, and this
 * helps keep things dry.
 */

function openOrClose(verb, args, player, players, rooms, items) {

  const isOpen = verb === 'open';

  player.emit('action', 1, items);

  if (player.isInCombat()) {
    return player.say('You are too busy for that right now.');
  }

  if (!args) {
    return player.say("Which door do you want to " + verb + "?");
  }

  args = args.toLowerCase().split(' ');

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

  if (isOpen && isLocked(exit)) {
    return player.say('That door is locked.');
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
    p => p.say(player.getName() + ' ' + verb + 's the door to ' + destTitle + '.'));

}

function useKey(verb, args, player, players, rooms) {
  util.log('USING KEY....')
  const isLocking = verb === 'lock';

  player.emit('action', 0, items);

  if (player.isInCombat()) {
    return player.say('You are too busy for that right now.');
  }

  args = args.toLowerCase().split(' ');

  if (!args) {
    return player.say(`Which door do you want to ${verb}`);
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
