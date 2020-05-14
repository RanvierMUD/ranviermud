const Combat = require("./Combat");

describe("Combat", () => {
  beforeAll(async () => {});
  describe("findCombatant", () => {
    it("returns null if the search array is empty", () => {
      expect(Combat.findCombatant(null, [])).toBeNull();
    });
  });
});
