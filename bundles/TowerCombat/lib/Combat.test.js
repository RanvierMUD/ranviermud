const Combat = require("./Combat");
const { Player, PlayerManager } = require("ranvier");
const init = require("../../../ranvier");
describe("Combat", () => {
  beforeAll(async () => {
  });
  describe("findCombatant", () => {
    it("returns null if the search array is empty", () => {
      expect(Combat.findCombatant(null, [])).toBeNull();
    });

    const data = {
      name: "PlayerOne",
    };
    const PlayerOne = new Player(data);

    it("Throws an error if target = self", async () => {
      const gameState = await init();
      console.log(gameState.keys())
      expect(Combat.findCombatant(PlayerOne, [""])).toBeNull();
    });
  });
});
