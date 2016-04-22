'use strict';
const util = require('util');
const Random = require('./random').Random;

const Time = {

  isDay: _isDay,
  isNight: _isNight,
  checkWeather: _checkWeather

};

/**
 * @return boolean isDay
 */
function _isDay() {
  const time = new Date().getHours();
  const daytime = time % 2;

  return !!daytime;
}

/**
 * @return boolean isNight
 */
function _isNight() { return !_isDay(); }

/**
 * Object with timecycle as keys (day/night)
 * containing arrays of strings to emit for weather events.
 * @return string Weather message for player.
 */

 const weather = {
   'day': ['stuff happens.'],
   'night': ['stuff happens at night.'],
   }
 };

/**
 * Will semi-randomly emit weather events to all outdoors rooms.
 * @param rooms    All rooms, to pass into weather emitter as needed.
 * @param players  See above, except all players.
 * @return boolean WeatherHappened
 */
function _checkWeather(rooms, players) {
  const shouldEmitWeather = Random.roll() > 18;
  if (shouldEmitWeather) {
    const cycle = _isDay() ? 'day' : 'night';
    const weather = Random.fromArray(weather[cycle]);
    emitWeather(weather, rooms, players);
  }
  return shouldEmitWeather;
}

/**
 * //TODO: Consider using event emitter. But maybe not.
 * Displays the weather event to any players who are outside.
 * @param string Event to display
 * @param rooms
 * @param players
 * @return void
 */

function emitWeather(weather, rooms, players) {
  const colorTags = ['<blue>', '</blue>'];
  const outdoors = rooms.rooms
    .filter(room => room.getBiome() === 'outdoors')
    .map(room => room.getLocation());

  const playersOutside = players
    .filter(player => outdoors.includes(player.getLocation()));

  let message = colorTags[0] + weather + colorTags[1];
  playersOutside.forEach(player => player.say(message));
}

exports.Time = Time;
