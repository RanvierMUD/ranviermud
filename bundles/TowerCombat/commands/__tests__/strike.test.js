const { command: strCommand } = require("../strike");
const Strike = require("../../lib/intraRoundCommitments/strike");
const Guard = require("../../lib/intraRoundCommitments/guard");

describe("strike command", () => {
  let character;
  beforeEach(() => {
    character = {
      isInCombat: function () {
        return false;
      },
      combatData: {
        decision: null,
      },
      emit: jest.fn(),
    };
  });
  it("emits outOfCombatErr if not in combat", () => {
    expect(character.emit).not.toHaveBeenCalled();
    expect(strCommand()(null, character)).toBeUndefined();
    expect(character.emit).toHaveBeenCalledWith("outOfCombatErr", "strike");
  });

  it("emits alreadyErr if command is already selected", () => {
    character.combatData.decision = new Strike();
    character.isInCombat = () => true;
    expect(character.emit).not.toHaveBeenCalled();
    expect(strCommand()(null, character)).toBeUndefined();
    expect(character.emit).toHaveBeenCalledWith("alreadyErr", "strike");
  });

  it("emits commandSwitch if another command is selected", () => {
    character.combatData.decision = new Guard();
    character.isInCombat = () => true;
    expect(character.emit).not.toHaveBeenCalled();
    expect(strCommand()(null, character)).toBeUndefined();
    expect(character.emit).toHaveBeenCalledWith("commandSwitch");
  });

  it("emits commandSwitch if another command is selected", () => {
    character.isInCombat = () => true;
    expect(character.emit).not.toHaveBeenCalled();
    expect(strCommand()(null, character)).toBeUndefined();
    expect(character.emit).toHaveBeenCalledWith("prepareCmd", "strike");
  });
});
