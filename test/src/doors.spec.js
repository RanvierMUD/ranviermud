'use strict';

const expect = require('chai').expect;
const Room = require('../../src/rooms').Room;
const Doors = require('../../src/doors').Doors;
const Mocks = require('../mocks/mocks.js');

const testRoom = new Room(Mocks.Room);

describe('Doors & Locks', () => {


  describe('findExit', () => {

    it('Should find an exit given a direction', () => {
      const found = Doors.findExit(testRoom, 'out');
      expect(found.length === 1).to.be.true;
    });

    it('Should not find an exit if the direction doesn\'t exist', () => {
      const found = Doors.findExit(testRoom, 'wat');
      expect(found.length === 0).to.be.true;
    });

  });

  describe('updateDestination', () => {
    const getLocation = () => '1';
    const player = { getLocation };
    const dest = {
      getExits: () => [{
        location: '1'
      }]
    };

    it('should call a callback if the exit exists', () => {
      let called = false;
      Doors.updateDestination(player, dest, () => {
        called = true;
      });

      expect(called).to.be.true;
    });


  });


});
