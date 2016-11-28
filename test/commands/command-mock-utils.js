'use strict';

const Npcs    = require('../../src/npcs').Npcs;
const Npc     = require('../../src/npcs').Npc;
const Items   = require('../../src/items').Items;
const Item    = require('../../src/items').Item;
const Players = require('../../src/player_manager').PlayerManager;
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

const addItem = ({
  uuid = 'item',
  keywords = ['item'],
  location = 1,
  wearLocation,
  short_description,
  room_description,
  attributes,
  room,
  player,
  items,
  equipped
  }) => {
    if (!items) { throw new Error('You need to pass in the items manager...'); }
    if (room && player) { throw new Error('You can not place the item in a room and in an inventory at the same time.'); }

    const item = new Item({ attributes, uuid, keywords, location, wearLocation, short_description, room_description });
    items.addItem(item);
    if (room)   { room.addItem(item); }
    if (player) { player.addItem(item); }
    if (equipped) {
      wearLocation = wearLocation || item.getAttribute('wearLocation');
      player.equip(wearLocation, item);
    }
    return item;
}

const addNpc = ({
  uuid = 'npc',
  keywords = ['npc'],
  location = 1,
  short_description,
  room_description,
  npcs,
  attributes,
  room,
  inventory
  }) => {
    if (!npcs) { throw new Error('You need to pass in the npcs manager...'); }
    if (!room) { throw new Error('You need to add the npc to a room.'); }

    const npc = new Npc({ attributes, uuid, keywords, location, short_description, room_description, inventory });
    npcs.add(npc); //TODO: Make consistent amongst manager classes (e.g., npcs.add vs items.addItem)
    if (room) { room.addNpc(npc.getUuid()); }

    return npc;
}

const getCallCounter = spy => {
  let counter = 0;
  return () => spy.getCall(counter++);
};

module.exports = {
  CommandInjector,
  getGlobals, getCallCounter,
  addItem, addNpc
};
