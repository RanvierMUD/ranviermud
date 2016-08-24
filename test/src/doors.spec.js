const expect = require('chai').expect;
const Room = require('../../src/rooms').Room;
const Doors = require('../../src/doors').Doors;
const Mocks = require('../mocks/mocks.js');

const testRoom = new Room(Mocks.Room);

describe('Doors & Locks', () => {

  it('Should find an exit given a direction', () => {
    const found = Doors.findExit(testRoom, 'out');
    expect(found.length === 1).to.be.true;
  });

});
