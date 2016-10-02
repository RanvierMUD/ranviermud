const expect = require('chai').expect;
const sinon  = require('sinon');
const Time = require('../../src/time.js').Time;

describe('checking to see if it is day or night', () => {
  it('should return day for an even-numbered hours', function() {
    this.clock = sinon.useFakeTimers();
    const isDay = Time.isDay();
    expect(isDay).to.be.true;
  });

  it('should return night for odd numbered hours', function() {
    this.clock = sinon.useFakeTimers();
    this.clock.tick(61 * 60 * 1000);
    const isDay = Time.isDay();
    expect(isDay).to.be.false;
  });
});
