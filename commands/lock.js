'use strict';
const CommandUtil = require('../src/command_util')
  .CommandUtil;
const l10nFile = __dirname + '/../l10n/commands/flee.yml';
const util = require('util');
const l10n = require('../src/l10n')(l10nFile);

//TODO: Finish since this is copied from close.js
exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {

    player.emit('action');

    if (player.isInCombat()) {
      return player.say('You are too busy for that right now.');
    }

    args = args.toLowerCase().split(' ');

    if (!args) {
      return player.say("Which door do you want to unlock?");
    }

    const room = rooms.getAt(player.getLocation());
    const exits = room
      .getExits()
      .filter(exit => exit.direction.indexOf(args[0]) > -1);

    if (exits.length !== 1) {
      return player.say('Be more specific...');
    }

    const exit = exits[0];

    if (!exit.door) {
      return player.say('There is no door.');
    }

    if (exit.door.open === true) {
      player.say('You close the door.');
      exit.door.open = false;
    }

    if (exit.door.locked) {
      return player.say('That door is already locked.');
    }

    const key = CommandUtil.findItemInInventory(exit.door.key, player, true);

    if (!key) {
      return player.say('You are missing the key.');
    }

    const dest       = rooms.getAt(exit.location);
    const srcTitle   = room.getTitle('en');
    const destTitle  = dest.getTitle('en');

    player.say('You lock the door.');
    exit.door.locked = true;

    dest
      .getExits()
      .filter(exit => exit.location === player.getLocation())
      .forEach(exit => unlockDoor(exit));


    players.eachIf(
      p => CommandUtil.inSameRoom(p, player),
      p => p.say(player.getName() + ' pulls out a key and locks the door to ' + destTitle + '.'));

    players.eachIf(
      p => p.getLocation() === exit.location,
      p => p.say('You hear a click from the direction of ' + srcTitle + '.'));
  };
};
