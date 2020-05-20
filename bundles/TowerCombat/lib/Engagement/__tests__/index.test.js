const { generateEngagement } = require("../../__tests__/helperFns/");

describe("Engagement", () => {
  describe("generates tuples", () => {
    const combatatantCounts = [
      [1, 1],
      [2, 3],
      [3, 6],
      [4, 10],
    ];
    it.each(combatatantCounts)(
      "for a number of combatants, correctly assigns a tuple to every combination",
      (otherCombatants, totalTuples) => {
        const engagement = generateEngagement(otherCombatants);
        expect(engagement.characterList).toHaveLength(otherCombatants + 1);
        expect(engagement.tuples).toHaveLength(totalTuples);
      }
    );
  });
});
