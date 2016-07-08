const defaultAttributes = {
  max_health: 100,
  health:     90,
  max_sanity: 100,
  sanity:     70,
  energy:     90,
  max_energy: 100,

  stamina:    1,
  willpower:  1,
  quickness:  1,
  cleverness: 1,

  level:      1,
  experience: 0,
  mutagens:   0,
  attrPoints: 0,

  description: 'A person.'
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

const Player = {
  attributes:  defaultAttributes,
  preferences: defaultPreferences,
  skills:      {},
  feats:       {}
};

module.exports = {
  defaultAttributes,
  defaultPreferences,
  Rooms,
  Player
};
