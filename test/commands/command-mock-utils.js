'use strict';

const Npcs    = require('../../src/npcs').Npcs;
const Items   = require('../../src/items').Items;
const Players = require('../../src/player_manager').PlayerManager;
const Rooms   = require('../../src/rooms').Rooms;
const Item    = require('../../src/items').Item;

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
  attributes,
  room,
  player,
  items,
  equipped
  }) => {
    if (!items) { throw new Error('You need to pass in the items manager...'); }
    if (room && player) { throw new Error('You can not place the item in a room and in an inventory at the same time.'); }

    const item = new Item({ attributes, uuid, keywords, location, wearLocation, short_description });
    items.addItem(item);
    if (room) { room.addItem(item.getUuid()); }
    if (player) { player.addItem(item); }
    if (equipped) {
      wearLocation = wearLocation || item.getAttribute('wearLocation');
      player.equip(wearLocation, item);
    }
    return item;
}

const getCallCounter = fn => {
  let counter = 0;
  return () => fn.getCall(counter++);
};

module.exports = {
  CommandInjector, getGlobals, addItem, getCallCounter
};
