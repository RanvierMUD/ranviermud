const Room = require('../../src/rooms').Room;

//TODO: Extract into mocks.js
const lockedDoor = {
  door: {
    locked: true,
    key: 'potato',
  }
};

const openedDoor = {
  door: {
    open: true
  }
};


const mockRoom = {
  title:       'pants',
  description: 'lol',

  location:     Infinity,
  area:        'PotatoLand',

  exits: [
    openedDoor, lockedDoor,
  ],
};

const testRoom = new Room(mockRoom);
