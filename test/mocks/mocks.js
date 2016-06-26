const defaultAttributes = {
  // Copied from
  max_health: 100,
  health: 90,
  max_sanity: 100,
  sanity: 70,
  energy: 40,
  max_energy: 50,

  stamina: 1,
  willpower: 1,
  quickness: 1,
  cleverness: 1,

  level: 1,
  experience: 0,
  mutagens: 0,
  attrPoints: 0,

  description: 'A person.'
};

const Rooms = {
  getAt: () => 'Correct',
};

module.exports = {
  defaultAttributes,
  Rooms
};
