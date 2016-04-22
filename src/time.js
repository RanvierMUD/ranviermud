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
 * Will semi-randomly emit weather events to all outdoors rooms.
 * @return boolean WeatherHappened
 */
function checkWeather() {
  const shouldEmitWeather =
}

exports.Time = Time;
