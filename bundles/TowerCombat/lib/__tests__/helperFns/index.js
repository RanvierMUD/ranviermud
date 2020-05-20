const Engagement = require("../../Engagement/index");
const basePlayer = require("../../../playerFixtures/tom.json");
const _ = require("lodash");

let playerID = 0;
const nameArray = [
  "Tom Bombadil",
  "Jesse Owens",
  "Barrack Obama",
  "Sarah Michelle Gellar",
  "J Jonah Jameson",
  "Tim McGraw",
  "Altair",
  "Quid",
  "Spiderman",
];
const generatePlayer = () => {
  const clonedPlayer = _.cloneDeep(basePlayer);
  clonedPlayer.name = nameArray[playerID];
  clonedPlayer.isInCombat = () => true;
  playerID++;
  clonedPlayer.emit = jest.fn();
  return clonedPlayer;
};

const generateEngagement = (combatants) => {
  const loopingPlayer = generatePlayer();
  loopingPlayer.combatants = new Set();
  for (let i = 0; i < combatants; i++) {
    loopingPlayer.combatants.add(generatePlayer());
  }
  const engagement = new Engagement(loopingPlayer);
  return engagement;
};

const generateState = (stateOverrides) => {
  const state = {
    CommandManager: {
      get: () => {},
      find: () => {},
    },
    ChannelManager: {
      find: () => {},
    },
    SkillManager: {
      find: () => {},
    },
  };
  return {
    ...state,
    ...stateOverrides,
  };
};

module.exports = {
  generateEngagement,
  generatePlayer,
  generateState,
};
