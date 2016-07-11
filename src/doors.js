//TODO: Implement helper functions for:
// open/close, lock/unlock, and other player and NPC interactions with doors.

'use strict';
const CommandUtil = require('./command_util').CommandUtil;
const util = require('util');

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

exports.DoorUtil = {
  has,       updateDestination,
  findExit,  openOrClose };

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
        p => p.getLocation() === exit.location,
        p => p.say('The door to ' + srcTitle + ' ' + nounPhrase + '.'));
    });

  players.eachIf(
    p => CommandUtil.inSameRoom(p, player),
    p => p.say(player.getName() + ' ' + verb + 's the door to ' + dest + '.'));


};
