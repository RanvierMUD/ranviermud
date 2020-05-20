const CombatMap = require("../CombatMap");
const { combatMapDefaults } = require("../../Combat.enums");
describe("CombatMap", () => {
  const playerOne = {
    name: "Tom Bombadil",
    lastDir: "east",
  };
  const playerTwo = {
    name: "Saruman",
    lastDir: "east",
  };
  it("has a coordinate for a player", () => {
    const map = new CombatMap([playerOne]);

    expect(map.gridMembers).toBeDefined();
    expect(map.gridMembers["Tom Bombadil"]).toBeDefined();
    expect(map.gridMembers["Tom Bombadil"].coordinate).toEqual(
      combatMapDefaults[playerOne.lastDir]
    );
  });

  it("generateCoordates returns a tuple", () => {
    const map = new CombatMap([playerOne, playerTwo]);
    const tomsCoord = map.gridMembers["Tom Bombadil"]["coordinate"];
    const sarumansCoord = map.gridMembers["Saruman"]["coordinate"];

    expect(tomsCoord).not.toEqual(sarumansCoord);
  });

  it("characters face the dir they entered", () => {
    const map = new CombatMap([playerOne, playerTwo]);
    const tomsFacing = map.gridMembers["Tom Bombadil"]["facing"];

    expect(tomsFacing).toEqual(playerOne.lastDir);
  });
});
