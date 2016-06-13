'use strict';
const CommandUtil = require('../src/command_util')
  .CommandUtil;
const l10nFile = __dirname + '/../l10n/commands/flee.yml';
const util = require('util');
const l10n = require('../src/l10n')(l10nFile);

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {

    if (player.isInCombat()) {
      player.say('You are too busy for that right now.');
      return;
    }

    args = args.toLowerCase().split(' ');

    const room = rooms.getAt(player.getLocation());
    const exits = room.getExits()
      .filter(exit => exit.direction.indexOf(args[0]) > -1);

    if (exit.length !== 1) {
      player.say('Which door do you want to open?');
      return;
    }

    const exit = exits[0];

    if (!exit.door) {
      player.say('There is no door.');
      return;
    }


    if (exit.door.open === true) {
      player.say('That door is already opened.');
      return;
    }

    player.say('You open the door.');
    exit.door.open = true;

    const dest = rooms.getAt(exit.location);
    const src = rooms.getAt(player.getLocation());
    dest
      .getExits()
      .filter(exit => exit.location === player.getLocation())
      .forEach(exit => exit.door.open = true);


    players.eachIf(
      p => CommandUtil.inSameRoom(p, player),
      p => {
        const destTitle = dest.getTitle('en');
        p.say(player.getName() + ' opens the door to ' + dest + '.');
      });

    players.eachIf(
      p => p.getLocation() === exit.location,
      p => {
        const srcTitle = src.getTitle('en');
        p.say('The door to ' + src + ' swings open.');
      });
  };
};
