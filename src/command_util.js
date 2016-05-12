'use strict';
const util = require('util');

const CommandUtil = {

  findItemInRoom:      _findItemInRoom,
  findItemInInventory: _findItemInInventory,
  findNpcInRoom:       _findNpcInRoom,
  otherPlayerInRoom:   _inSameRoom,
  inSameRoom:          _inSameRoom,
  parseDot:            _parseDot,
  meetsPrerequisites:  _meetsPrerequisites,

};


/**
 * @param Player|NPC entity
 * @param Player     target
 * @return boolean   True if they are in the same room, else false.
 */
function _inSameRoom(entity, target) {
  if (target) {
    if (entity.getName) { // Handle players
      let notSameName = target.getName() !== entity.getName();
      let sameLocation = target.getLocation() === entity.getLocation();
      return notSameName && sameLocation;
    } else { // Handle NPCs
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
    return items.get(item).hasKeyword(this.keyword, player.getLocale());
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
    id => npcs.get(id).hasKeyword(this.keyword, player.getLocale())
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
    item => item.hasKeyword(this.keyword, being.getLocale())
    );

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

/**
 * Does the player meet the prereqs for the feat, including cost?
 * @param  Player
 * @param  Feat
 * @return  bool True if they meet all conditions and can afford the feat.
 */
function _meetsPrerequisites(player, feat) {
  if (!feat.prereqs && !feat.cost) { return true; }
  const attributes = player.getAttributes();

  for (let attr in feat.prereqs || {}) {
    let req = feat.prereqs[attr];
    let stat = attributes[attr];

    let meets = req <= stat;
    util.log(player.getName() + '\'s ' + attr + ': ' + stat + ' vs. ' + req);

    if (!meets) { return false; }
  }

  const isAffordable = feat.cost && attributes.mutagens >= feat.cost;
  return isAffordable;
}


exports.CommandUtil = CommandUtil;
