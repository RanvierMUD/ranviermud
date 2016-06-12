'use strict';
const util = require('util');

const CommandUtil = {

  //TODO: findItemInEquipment

  findItemInRoom:      _findItemInRoom,
  findItemInInventory: _findItemInInventory,
  findNpcInRoom:       _findNpcInRoom,
  inSameRoom:          _inSameRoom,
  parseDot:            _parseDot,
  values:              _values,

};

/**
 * Takes an object and returns an array of all of its values.
 * @param  Obj
 * @return Array of values */

function _values(obj) {
  let vals = [];
  for (const key in obj) {
    if (obj.hasOwnProperty(key)){
      vals.push(obj[key]);
    }
  }
  return vals;
}

/**
 * @param Player|NPC entity
 * @param Player     target
 * @return boolean   True if they are in the same room, else false.
 */
function _inSameRoom(entity, target) {
  if (target) {
    if (entity.getName) { // Handle players
      const notSameName = target.getName() !== entity.getName();
      const sameLocation = target.getLocation() === entity.getLocation();
      return notSameName && sameLocation;
    } else if (entity.getShortDesc) { // Handle NPCs and items
      return entity.getRoom() === target.getLocation();
    }
  }
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
function _findItemInRoom(items, lookString, room, player, hydrate) {
  hydrate = hydrate || false;
  let thing = CommandUtil.parseDot(lookString, room.getItems(), function(
    item) {
    let found = items.get(item);
    return found && found.hasKeyword(this.keyword, player.getLocale());
  });

  return thing ? (hydrate ? items.get(thing) : thing) : false;
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
function _findNpcInRoom(npcs, lookString, room, player, hydrate) {
  hydrate = hydrate || false;
  let thing = CommandUtil.parseDot(lookString, room.getNpcs(),
    function (id) {
      let npc = npcs.get(id);
      return npc && npc.hasKeyword(this.keyword, player.getLocale());
    }
  );

  return thing ? (hydrate ? npcs.get(thing) : thing) : false;
}


/**
 * Find an item in inventory based on the syntax
 *   things like: get 2.thing or look 6.thing or look thing
 * @param string lookString
 * @param object being This could be a player or NPC. Though most likely player
 * @return string UUID of the item
 */
function _findItemInInventory(lookString, being, hydrate) {
  hydrate = hydrate || false;
  let thing = CommandUtil.parseDot(lookString, being.getInventory(),
    function (item) {
      return item && item.hasKeyword(this.keyword, being.getLocale());
    });

  return thing ? (hydrate ? thing : thing.getUuid()) : false;
}


/**
 * Parse 3.blah item notation
 * @param string arg    The actual 3.blah string
 * @param Array objects The array of objects to search in
 * @param Function filterFunc Function to filter the list
 * @return object
 */
function _parseDot(arg, objects, filterFunc) {
  if (!arg) {
    util.log(arguments);
    return;
  }
  let keyword = arg.split(' ')[0];
  let multi = false;
  let nth = null;

  // Are they trying to get the nth item of a keyword?
  if (/^\d+\./.test(keyword)) {
    nth = parseInt(keyword.split('.')[0], 10);
    keyword = keyword.split('.')[1];
    multi = true;
  }

  let found = objects.filter(filterFunc, {
    keyword: keyword,
    nth: nth
  });

  if (!found.length) {
    return false;
  }

  let item = null;
  if (multi && !isNaN(nth) && nth && nth <= found.length) {
    item = found[nth - 1];
  } else {
    item = found[0];
  }

  return item;
}


exports.CommandUtil = CommandUtil;
