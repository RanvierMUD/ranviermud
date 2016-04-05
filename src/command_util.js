var util = require('util');

var CommandUtil = {
  /**
   * Find an item in a room based on the syntax
   *   things like: get 2.thing or look 6.thing or look thing
   * @param string lookString
   * @param Room   room
   * @param Player player
   * @param boolean hydrate Whether to return the id or a full object
   * @return string UUID of the item
   */
  findItemInRoom: function(items, lookString, room, player, hydrate) {
    hydrate = hydrate || false;
    var thing = CommandUtil.parseDot(lookString, room.getItems(), function(
      item) {
      return items.get(item).hasKeyword(this.keyword, player.getLocale());
    });

    return thing ? (hydrate ? items.get(thing) : thing) : false;
  },

  /**
   * Find an npc in a room based on the syntax
   *   things like: get 2.thing or look 6.thing or look thing
   * @param string lookString
   * @param Room   room
   * @param Player player
   * @param boolean hydrade Whether to return the id or a full object
   * @return string UUID of the item
   */
  findNpcInRoom: function(npcs, lookString, room, player, hydrate) {
    hydrate = hydrate || false;
    var thing = CommandUtil.parseDot(lookString, room.getNpcs(), function(
      id) {
      return npcs.get(id).hasKeyword(this.keyword, player.getLocale());
    });

    return thing ? (hydrate ? npcs.get(thing) : thing) : false;
  },

  /**
   * Find an item in inventory based on the syntax
   *   things like: get 2.thing or look 6.thing or look thing
   * @param string lookString
   * @param object being This could be a player or NPC. Though most likely player
   * @return string UUID of the item
   */
  findItemInInventory: function(lookString, being, hydrate) {
    hydrate = hydrate || false;
    var thing = CommandUtil.parseDot(lookString, being.getInventory(),
      function(item) {
        return item.hasKeyword(this.keyword, being.getLocale());
      });

    return thing ? (hydrate ? thing : thing.getUuid()) : false;
  },

  /**
   * Parse 3.blah item notation
   * @param string arg    The actual 3.blah string
   * @param Array objects The array of objects to search in
   * @param Function filterFunc Function to filter the list
   * @return object
   */
  parseDot: function(arg, objects, filterFunc) {
    var keyword = arg.split(' ')[0];
    var multi = false;
    var nth = null;
    // Are they trying to get the nth item of a keyword?
    if (/^\d+\./.test(keyword)) {
      nth = parseInt(keyword.split('.')[0], 10);
      keyword = keyword.split('.')[1];
      multi = true;
    }

    var found = objects.filter(filterFunc, {
      keyword: keyword,
      nth: nth
    });

    if (!found.length) {
      return false;
    }

    var item = null;
    if (multi && !isNaN(nth) && nth && nth <= found.length) {
      item = found[nth - 1];
    } else {
      item = found[0];
    }

    return item;
  },

  otherPlayerInRoom: function(player, target) {
    if (target)
      return (target.getName() !== player.getName() && target.getLocation() ===
        player.getLocation());
  },

  isCoinFlip: isCoinFlip,
  getRandomFromArr: getRandomFromArr,
  isDaytime: isDaytime

};

function isCoinFlip() {
  return Math.round(Math.random());
}

function getRandomFromArr(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/*
 *  Returns a boolean. Day and night cycle switches every real-life hour.
 */

function isDaytime() {
  var time = new Date().getHours();
  var daytime = time % 2;
  util.log("Time is " + time + "... is it daytime? " + !!daytime);

  return !!daytime;
}

exports.CommandUtil = CommandUtil;
