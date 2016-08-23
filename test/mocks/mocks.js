const Player = require('../../src/player.js').Player;
const mockPlayer = new Player();



const defaultAttributes = mockPlayer.getAttributes();
const defaultPreferences = mockPlayer.getPreferences();


const mockRooms = {
  getAt: () => 'Correct',
};

module.exports = {
  Player: mockPlayer,
  Rooms:  mockRooms,
  defaultAttributes,
  defaultPreferences,
};
