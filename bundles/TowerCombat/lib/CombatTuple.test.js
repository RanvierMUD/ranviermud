const playerData = require("../playerFixtures/tom.json");
const CombatTuple = require("./CombatTuple");

describe("CombatTuple", () => {
  const hasAttribute = jest.fn();
  const getAttribute = () => 10;
  const playerTwo = {
    ...playerData,
    name: "Saruman",
    lastDir: "east",
    hasAttribute,
    combatData: {},
    getAttribute,
  };
  const playerOne = {
    ...playerData,
    name: "Tom Bombadil",
    lastDir: "east",
    combatants: [playerTwo],
    combatData: {},
    hasAttribute,
    getAttribute,
  };

  it("Creates a tuple with the characters you insert", () => {
    const tuple = new CombatTuple(playerOne, playerTwo);

    expect(tuple.characters).toEqual([playerOne, playerTwo]);
  });
  it("Can find if two combatants have a tuple already going", () => {
    const tuple = new CombatTuple(playerOne, playerTwo);

    expect(CombatTuple.hasTuple(playerOne, playerTwo)).toBeTruthy();
  });
  it("Can find if two combatants have a tuple already going", () => {
    const tuple = new CombatTuple(playerOne, playerTwo);

    expect(CombatTuple.getTuple(playerOne, playerTwo)).toEqual(tuple);
  });
});
