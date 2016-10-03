const expect = require('chai').expect;
const sinon  = require('sinon');
const Time = require('../../src/time.js').Time;
const Random = require('../../src/random.js').Random;

describe('checking to see if it is day or night', () => {

  afterEach(function () { this.clock.restore(); });

  it('should return day for an even-numbered hours', function() {
    this.clock = sinon.useFakeTimers();
    const isDay = Time.isDay();
    expect(isDay).to.be.true;
  });

  it('should return night for odd numbered hours', function() {
    this.clock = sinon.useFakeTimers();
    this.clock.tick(61 * 60 * 1000);
    const isNight = Time.isNight();
    expect(isNight).to.be.true;
  });

});

describe('weather stuff', () => {

  afterEach(function () { this.clock.restore(); });

  const fakeRoom = {
    getBiome: () => 'outdoors'
  };
  const fakeRooms = {
    getAt: () => fakeRoom
  };
  const fakePlayer = {
    getLocation: () => {},
    say: sinon.spy()
  }
  const fakePlayers = {
    filter: cb => [ fakePlayer ].filter(cb)
  };


  const possibleWeatherEvents = [
    'The clouds part for a second.',
    'Rain spatters against the ground.'
  ]; //.map(s => '<blue>' + s + '</blue>');

  // Weather will always emit
  Random.roll = sinon.stub().returns(99);

  it('should emit weather', function() {
    // Should be day
    this.clock = sinon.useFakeTimers();

    const emitted = Time.checkWeather(fakeRooms, fakePlayers);
    expect(possibleWeatherEvents.indexOf(emitted) > -1).to.be.true;
  });

  it('should return false when no weather emits', () => {
    Random.roll.returns(4);
    const emitted = Time.checkWeather(fakeRooms, fakePlayers);
    expect(emitted).to.be.false;
  });

});
