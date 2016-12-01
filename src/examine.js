'use strict';
/*
 * For reducing boilerplate on examine listeners.
 *
 * config object:
 *
 *  poi : An array or object with Points Of Interest.
 *    It can be an array of strings or an object with strings as the keys and
 *    functions as the values.
 *
 *  action: Needed if poi is an array of strings,
 *    It is the function to run if the POI is found.
 *
 *  (optional) notFound: Function to run if the POI is
 *    not found. A default is provided.
 */

//TODO: Change command so that it can work on any item, npc, or room by emitting.
// Then this func will be used if it does not find any valid items, npcs, etc.

const util = require('util');
const _ = require('./helpers');

module.exports.examine = (args, player, players, config) => {



  const target = _.firstWord(args);

  // Check to make sure config is valid.
  if (!config.poi || (!config.found && config.poi.length)) {
    util.log("Invalid config for examine event: ", config);
    return;
  }

  // Set defaults as needed.
  const defaultCheck = check => true;
  const nothingFound = () => {
    player.say('You find nothing of interest.');
    players.eachIf(p => CommandUtil.inSameRoom(player, p),
      p => p.say(player.getName() + ' seems to be searching for... something.'));
  };
  config.nothingFound = config.nothingFound || nothingFound;
  config.check = config.check || defaultCheck;

  // Handle POI as an object.
  if (!config.poi.length && config.check()) {
    if (target in config.poi) { config.poi[target](); }
    else { config.nothingFound(); }
    return;
  }

  const foundIt = _.has(config.poi, target);

  return foundIt && config.check() ?
    config.found() :
    config.nothingFound();

};
