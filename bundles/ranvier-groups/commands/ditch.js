'use strict';

const Ranvier = require('ranvier');
const { Broadcast } = Ranvier;
const { CommandParser } = Ranvier.CommandParser;

module.exports = {
  command: state => (arg, player) => {
    if (!arg || !arg.length) {
      return Broadcast.sayAt(player, 'Ditch whom?');
    }

    let target = CommandParser.parseDot(arg, player.followers);

    if (!target) {
      return Broadcast.sayAt(player, "They aren't following you.");
    }

    Broadcast.sayAt(player, `You ditch ${target.name} and they stop following you.`);
    Broadcast.sayAt(target, `${player.name} ditches you and you stop following them.`);
    target.unfollow();
  }
};
