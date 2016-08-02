'use strict';
const util = require('util');
const Random = require('./random').Random;

const Time = {
  isDay, isNight,
  checkWeather
};

/**
 * @return boolean isDay
 */
function isDay() {
  const hours = new Date().getHours();
  const isDaytime = hours % 2;

  return !!isDaytime;
}

/**
 * @return boolean isNight
 */
function isNight() {
  return !isDay();
}


/**
 * Will semi-randomly emit weather events to all outdoors rooms.
 * @param rooms    All rooms, to pass into weather emitter as needed.
 * @param players  See above, except all players.
 * @return boolean WeatherHappened | string Weather that happened.
 */
function checkWeather(rooms, players) {
  const shouldEmitWeather = Random.roll(1, 100) >= 98;

  if (shouldEmitWeather) {
    const cycle = isDay() ? 'day' : 'night';
    return selectWeather(cycle, rooms, players);
  }
  return false;
}


/**
 * Chooses a weather event from an array according to time of day.
 * @param string Cycle (day or night)
 * @param rooms    All rooms, to pass into weather emitter as needed.
 * @param players  See above, except all players.
 * @return string Weather message
 */
function selectWeather(cycle, rooms, players) {
  const weather = {
    'day': ['The clouds part for a second.', 'Rain spatters against the ground.'],
    'night': ['It is raining.', 'Thunder crackles in the distance.'],
  };
  const weatherEvent = Random.fromArray(weather[cycle]);
  return emitWeather(weatherEvent, rooms, players);
}


/**
 * //TODO: Consider using event emitter. But maybe not.
 * Displays the weather event to any players who are outside.
 * @param string Event to display
 * @param rooms
 * @param players
 * @return string weather
 */
function emitWeather(weatherEvent, rooms, players) {
  const colorTags = ['<blue>', '</blue>'];

  const playersOutside = players
    .filter(player => {
      const room = rooms.getAt(player.getLocation());
      return room.getBiome() === 'outdoors';
    });

  let message = colorTags[0] + weatherEvent + colorTags[1];
  playersOutside.forEach(player => player.say(message));
  return weatherEvent;
}

exports.Time = Time;
