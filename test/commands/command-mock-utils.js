const Npcs    = require('../../src/npcs').Npcs;
const Items   = require('../../src/items').Items;
const Players = require('../../src/player_manager').Players;
const Rooms   = require('../../src/rooms').Rooms;

/*
  Takes a command function and an array of mocks in order:
  [rooms, items, players, npcs, Commands]
  and injects the mocks into the command, returning another function that takes
  (args, player)
*/
const CommandInjector = (cmd, globals) => cmd(...globals);

const getGlobals = () => {
  const rooms    = new Rooms([]);
  const items    = new Items([]);
  const players  = new Players([]);
  const npcs     = new Npcs([]);
  const Commands = {};

  return [ rooms, items, players, npcs, Commands ];
}

module.exports = {
  CommandInjector, getGlobals
};
