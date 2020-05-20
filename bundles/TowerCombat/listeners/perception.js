const { Broadcast: B, Logger } = require("ranvier");

const generalPercepMap = {
  ATTACK: ({ name }) => `${name} has taken an aggressive stance.`,
  DEFEND: ({ name }) => `${name} is on the defensive.`,
  BIG_ATTACK: ({ name }) => `${name} is winding up for a big hit!`,
  BIG_DEFENSE: ({ name }) => `${name} is poised to withdraw.`,
};

const specificPercepMap = {
  PROBE: ({ name, his }) =>
    `${name} thrusts ${his} weapon forward, searching for an opening.`,
  GUARD: ({ name, his }) =>
    `${name} has assumed a neutral stance, biding ${his} time.`,
  STRIKE: ({ name }) => `${name} is prepared to strike!`,
  DODGE: ({ name }) => `${name} !`,
};

module.exports = {
  perceptSuccess: (state) =>
    function (decision, opposition) {
      const { config } = decision;
      B.sayAt(this, specificPercepMap[config.type](opposition));
    },
  partialPerceptSuccess: (state) =>
    function (decision, opposition) {
      const { config } = decision;
      if (typeof generalPercepMap[config.perceiveAs] === "object") {
        B.sayAt(this, generalPercepMap[config.perceiveAs](opposition));
        return;
      }
      Logger.log(
        `Failed a type check, decision type ${config.type}: perceiveAs: ${config.perceiveAs}`
      );
    },
  criticalPerceptFailure: (state) =>
    function (decision, opposition) {
      const { config } = decision;
      B.sayAt(this, generalPercepMap[config.perceiveAs](opposition));
    },
};
