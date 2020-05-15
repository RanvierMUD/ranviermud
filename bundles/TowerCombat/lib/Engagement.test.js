const Engagement = require("./Engagement");
const playerData = require("../playerFixtures/tom.json");
const CombatTuple = require("./CombatTuple");

describe("Engagement", () => {
  let playerOne,
    playerTwo,
    playerThree,
    playerFour,
    hasAttribute,
    getAttribute,
    playerFive;
  beforeEach(() => {
    hasAttribute = () => true;
    getAttribute = () => 10;
    playerTwo = {
      ...playerData,
      name: "Saruman",
      lastDir: "east",
      hasAttribute,
      combatData: {},
      getAttribute,
    };
    playerThree = {
      ...playerData,
      name: "Aragorn",
      lastDir: "east",
      hasAttribute,
      combatData: {},
      getAttribute,
    };
    playerFour = {
      ...playerData,
      name: "Gandalf",
      lastDir: "east",
      hasAttribute,
      combatData: {},
      getAttribute,
    };
    playerFive = {
      ...playerData,
      name: "Mandalf",
      lastDir: "east",
      hasAttribute,
      combatData: {},
      getAttribute,
    };
    playerOne = {
      ...playerData,
      name: "Tom Bombadil",
      lastDir: "east",
      combatants: [playerTwo],
      combatData: {},
      hasAttribute,
      getAttribute,
    };
  });

  describe("generates tuples", () => {
    it("for two combatants", () => {
      const engagement = new Engagement(playerOne);
      expect(engagement.tuples).toHaveLength(1);
    });
    it("for three combatants", () => {
      playerOne.combatants = [...playerOne.combatants, playerThree];
      const engagement = new Engagement(playerOne);
      expect(playerOne.combatants).toHaveLength(2);
      expect(engagement.tuples).toHaveLength(3);
    });
    it("for four combatants", () => {
      playerOne.combatants = [...playerOne.combatants, playerThree, playerFour];
      const engagement = new Engagement(playerOne);
      expect(playerOne.combatants).toHaveLength(3);
      expect(engagement.tuples).toHaveLength(6);
    });
    it("for five combatants", () => {
      playerOne.combatants = [
        ...playerOne.combatants,
        playerThree,
        playerFour,
        playerFive,
      ];
      const engagement = new Engagement(playerOne);
      expect(playerOne.combatants).toHaveLength(4);
      expect(engagement.tuples).toHaveLength(10);
      expect(CombatTuple.hasTuple(playerOne, playerTwo)).toBeTruthy();
      expect(CombatTuple.hasTuple(playerOne, playerThree)).toBeTruthy();
      expect(CombatTuple.hasTuple(playerOne, playerFour)).toBeTruthy();
      expect(CombatTuple.hasTuple(playerOne, playerFive)).toBeTruthy();
      expect(CombatTuple.hasTuple(playerTwo, playerThree)).toBeTruthy();
      expect(CombatTuple.hasTuple(playerTwo, playerFour)).toBeTruthy();
      expect(CombatTuple.hasTuple(playerTwo, playerFive)).toBeTruthy();
      expect(CombatTuple.hasTuple(playerThree, playerFour)).toBeTruthy();
      expect(CombatTuple.hasTuple(playerThree, playerFive)).toBeTruthy();
      expect(CombatTuple.hasTuple(playerFour, playerFive)).toBeTruthy();
    });
  });
});
