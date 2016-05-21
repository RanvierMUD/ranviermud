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

var util = require('util');

module.exports.examine = (args, player, players, config) => {

  args = args.toLowerCase();
  // Check to make sure config is valid.
  if (!config.poi || (!config.found && config.poi.length)) {
    util.log("Invalid config for examine event: ", config);
    return;
  }

  // Set defaults as needed.
  const defaultCheck = check => true;
  config.nothingFound = config.nothingFound || nothingFound;
  config.check = config.check || defaultCheck;

  // Handle POI as an object.
  if (!config.poi.length && config.check()) {
    if (args in config.poi) { config.poi[args](); }
    else { config.nothingFound(); }
    return;
  }

  var valid = config.poi.indexOf(args) > -1;

  valid && config.check() ? config.found() : config.nothingFound();

}

function nothingFound() {
  player.say('You find nothing of interest.');
  players.eachIf(p => CommandUtil.otherPlayerInRoom(player, p),
    p => { p.say(player.getName() + ' seems to be searching for... something.'); });
}
