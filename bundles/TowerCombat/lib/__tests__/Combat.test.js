const Combat = require("../Combat");
const { generateEngagement, generateState } = require("./helperFns");
const Guard = require("../intraRoundCommitments/Guard");

describe("Combat", () => {
  describe("findCombatant", () => {
    it("Exits the loop early if the engagements lag has not elapsed", () => {
      const engagement = generateEngagement(1);
      const character = engagement.characters[0];
      engagement.lag = 1;
      expect(Combat.updateRound(null, character)).toBeFalsy();
    });
    it("Enters the loop when lag is < 0", () => {
      const engagement = generateEngagement(1);
      const character = engagement.characters[0];
      engagement.lag = -1;
      const stateOverrides = {
        CommandManager: {
          find: () => true,
          get: () => new Guard(character, engagement.characters[1]),
        },
      };
      expect(
        Combat.updateRound(generateState(stateOverrides), character)
      ).not.toBe(false);
    });
  });
});
