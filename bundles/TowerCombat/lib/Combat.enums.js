const roundState = {
  PREPARE: "PREPARE",
  REACT: "REACT",
  RESOLUTION: "RESOLUTION",
};

const combatOptions = {
  STRIKE: "STRIKE",
  DODGE: "DODGE",
  BLOCK: "BLOCK",
  RETREAT: "RETREAT",
  FEINT: "FEINT",
};

const combatMapDefaults = {
  east: {
    x: 10,
    y: 0,
  },
  west: {
    x: -10,
    y: 0,
  },
  north: {
    x: 0,
    y: 10,
  },
  south: {
    x: 0,
    y: -10,
  },
};

module.exports = {
  roundState,
  combatOptions,
  combatMapDefaults,
};
