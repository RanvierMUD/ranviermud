'use strict';
const util = require('util');
const _ = require('./helpers');
const Type = require('./type').Type;

const CommandUtil = {
  findItemInEquipment, findItemInRoom,
  findItemInInventory, hasScript,
  findNpcInRoom      , inSameRoom,
  parseDot           ,
};

const ifExists = (thing, hydrate) => thing ? (hydrate ? thing : thing.getUuid()) : false;

/**
 * Takes an object and name of event to emit and tells you if it has a listener.
 * @param  Obj
 * @param  String name of event
 * @return Boolean if event has listener
 */

function hasScript(entity, event){
  return entity._events && entity._events[event];
}

/**
 * @param Player|NPC entity
 * @param Player     target
 * @return boolean   True if they are in the same room, else false.
 */
function inSameRoom(entity, target) {
  if (target) {
    if (Type.isPlayer(target)) { // Handle players
      //TODO: Make APIs consistent and not awful.
      const notSameName  = target.getName() !== entity.getName();
      const sameLocation = target.getLocation() === entity.getLocation();
      return notSameName && sameLocation;
    } else if (Type.isNpc(target) || Type.isItem(target)) { // Handle NPCs and items
      return entity.getRoom() === target.getLocation();
    }
  }
}

/**
 * Find an item in a room based on the syntax
 *   things like: get 2.thing or look 6.thing or look thing
 * @param string lookString
 * @param Being player | npc
 * @param boolean hydrate Whether to return the id or a full object
 * @return string UUID of the item
 */

function findItemInEquipment(items, lookString, being, hydrate) {
  const equipment = _.values(being.getEquipped()).map(items.get);
  const thing = CommandUtil.parseDot(lookString, equipment,
    function(item) {
      return item && item.hasKeyword(this.keyword, being.getLocale());
    });

  return ifExists(thing, hydrate);
}


/**
 * Find an item in a room based on the syntax
 *   things like: get 2.thing or look 6.thing or look thing
 * @param string lookString
 * @param Room   room
 * @param Player player
 * @param boolean hydrate Whether to return the id or a full object
 * @return string UUID of the item
 */
function findItemInRoom(items, lookString, room, player, hydrate) {
  const itemsList = room.getItems().map(items.get);
  let thing = CommandUtil.parseDot(lookString, itemsList, function(item) {
    return item && item.hasKeyword(this.keyword, 'en');
  });
  return ifExists(thing, hydrate);
}


/**
 * Find an npc in a room based on the syntax
 *   things like: get 2.thing or look 6.thing or look thing
 * @param string lookString
 * @param Room   room
 * @param Player player
 * @param boolean hydrate Whether to return the id or a full object
 * @return string UUID of the item
 */
function findNpcInRoom(npcs, lookString, room, player, hydrate) {
  const npcsInRoom = room.getNpcs().map(npcs.get);
  let thing = CommandUtil.parseDot(lookString, npcsInRoom,
    function (npc) {
      return npc && npc.hasKeyword(this.keyword, 'en');
    }
  );

  return ifExists(thing, hydrate);
}


/**
 * Find an item in inventory based on the syntax
 *   things like: get 2.thing or look 6.thing or look thing
 * @param string lookString
 * @param object being This could be a player or NPC. Though most likely player
 * @return string UUID of the item
 */
function findItemInInventory(lookString, being, hydrate) {
  let thing = CommandUtil.parseDot(lookString, being.getInventory(),
    function (item) {
      return item && item.hasKeyword(this.keyword, being.getLocale());
    });
  return ifExists(thing, hydrate);
}



/**
 * Parse 3.blah item notation
 * @param string arg    The actual 3.blah string
 * @param Array objects The array of objects to search in
 * @param Function filterFunc Function to filter the list
 * @return object
 */
function parseDot(arg, objects, filterFunc) {
  if (!arg) {
    util.log("ERROR: No arg passed into parseDot: ", arguments);
    return;
  }
  let keyword = _.firstWord(arg);
  let multi = false;
  let nth = null;

  // Are they trying to get the nth item of a keyword?
  if (/^\d+\./.test(keyword)) {
    nth = parseInt(keyword.split('.')[0], 10);
    keyword = keyword.split('.')[1];
    multi = true;
  }

  const found = objects.filter(filterFunc, { keyword, nth });

  if (!found.length) { return false; }

  const areMultiples = multi && !isNaN(nth) && nth && nth <= found.length
  return areMultiples ?
    found[nth - 1] :
    found[0];

}


exports.CommandUtil = CommandUtil;
