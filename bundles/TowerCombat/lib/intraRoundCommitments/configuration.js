const { perceptionTypes, commandTypes } = require("./commands.enum");

module.exports = {
  guard: {
    castTime: 0, // In rounds, 2 is the standard motion, 1 is incredibly quick, 4 is for any heavier motion
    range: 5, // 5 is the standard sword range.
    interruptable: null, // An object, keys are current round in progress, 1-100 how interruptible it is (higher is more interruptible)
    type: commandTypes.GUARD, // enum for the name of the command
    disruptive: 0, // How disruptive this is. 0 being not at all. 100 being very
    perceiveAs: perceptionTypes.DEFENSE, // The generic response to a mixed success perception roll
    perceptMod: 1, // 0-1, your ability to perceive while executing.
    perceptThreshold: 10, // 2-100, 100 being very difficult to see coming, 2 being more or less guaranteed to see.
  },
  dodge: {
    castTime: 4,
    range: 5,
    interruptable: {
      1: 80,
      2: 80,
      3: null,
      4: null,
    },
    type: commandTypes.DODGE,
    disruptive: 0,
    perceiveAs: perceptionTypes.DEFENSE,
    perceptMod: 0.5,
    perceptThreshold: 8,
  },
  parry: {
    castTime: 3,
    range: 5,
    interruptable: null,
    type: commandTypes.PARRY,
    disruptive: 0,
    perceiveAs: perceptionTypes.DEFENSE,
    perceptMod: 0.8,
    perceptThreshold: 5,
  },
  probe: {
    castTime: 0,
    range: 5,
    interruptable: null,
    type: commandTypes.PROBE,
    disruptive: 0,
    perceiveAs: perceptionTypes.ATTACK,
    perceptMod: 1,
    perceptThreshold: 10,
  },
  light: {
    castTime: 4,
    range: 5,
    interruptable: null,
    type: commandTypes.LIGHT,
    disruptive: 2,
    perceiveAs: perceptionTypes.ATTACK,
    perceptMod: 0.5,
    perceptThreshold: 7,
  },
  heavy: {
    castTime: 6,
    range: 5,
    interruptable: null,
    type: commandTypes.HEAVY,
    disruptive: 80,
    perceiveAs: perceptionTypes.ATTACK,
    perceptMod: 0.2,
    perceptThreshold: 10,
  },
};
