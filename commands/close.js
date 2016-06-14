'use strict';
const CommandUtil = require('../src/command_util')
  .CommandUtil;
const l10nFile = __dirname + '/../l10n/commands/flee.yml';
const util = require('util');
const l10n = require('../src/l10n')(l10nFile);

//TODO: Dry up this and open.js since they are almost the same.
exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {

    if (player.isInCombat()) {
      player.say('You are too busy for that right now.');
      return;
    }

    args = args.toLowerCase().split(' ');

    if (!args) {
      player.say("Which door do you want to close?");
      return;
    }

    const room = rooms.getAt(player.getLocation());
    const exits = room
      .getExits()
      .filter(exit => exit.direction.indexOf(args[0]) > -1);

    if (exits.length !== 1) {
      player.say('Be more specific...');
      return;
    }

    util.log('exits: ', exits);
    const exit = exits[0];

    util.log('exit: ', exit);

    if (!exit.door) {
      player.say('There is no door.');
      return;
    }


    if (exit.door.open !== true) {
      player.say('That door is already closed.');
      return;
    }

    const dest = rooms.getAt(exit.location);

    const srcTitle = room.getTitle('en');
    const destTitle = dest.getTitle('en');

    player.say('You close the door to ' + destTitle + '.');
    exit.door.open = false;

    dest
      .getExits()
      .filter(exit => exit.location === player.getLocation())
      .forEach(exit => exit.door.open = false);


    players.eachIf(
      p => CommandUtil.inSameRoom(p, player),
      p => p.say(player.getName() + ' closes the door to ' + destTitle + '.'));

    players.eachIf(
      p => p.getLocation() === exit.location,
      p => p.say('The door to ' + srcTitle + ' slams shut.'));
  };
};
