const defaultAttributes = {
  max_health: 100,
  health:     80,
  energy:     90,
  max_energy: 100,

  stamina:    1,
  willpower:  1,
  quickness:  1,
  cleverness: 1,

  level:      1,
  experience: 0,

};

const defaultPreferences = {
  target: 'body',
  wimpy: 30,
  stance: 'normal',
  roomdescs: 'default'
};

const Rooms = {
  getAt: () => 'Correct',
};



const lockedDoor = {
  door: {
    locked: true,
    key: 'potato',
  },
  direction: 'out'
};

const openedDoor = {
  door: {
    open: true
  },
  direction: 'in'
};

const Room = {
  title:       'pants',
  description: 'lol',

  location:     Infinity,
  area:        'PotatoLand',

  exits: [
    openedDoor, lockedDoor,
  ],
};

const Player = {
  attributes:  defaultAttributes,
  preferences: defaultPreferences,
  skills:      {},
};

module.exports = {
  defaultAttributes,
  defaultPreferences,
  Rooms,
  Player,
  Room,
  openedDoor,
  lockedDoor
};
