const { command: strCommand } = require("../strike");
const Strike = require("../../lib/intraRoundCommitments/strike");
const Guard = require("../../lib/intraRoundCommitments/guard");
const Engagement = require('../../lib/Engagement')

describe("strike command", () => {
  let character, target;
  beforeEach(() => {
    
    target = {
      isInCombat: function () {
        return false;
      },
      combatData: {
        decision: null,
      },
      emit: jest.fn(),
      getAttribute: () => 10,
      hasAttribute: () => true
    };
    character = {
      isInCombat: function () {
        return false;
      },
      combatData: {
        decision: null,
      },
      combatants: [target],
      emit: jest.fn(),
      getAttribute: () => 10,
      hasAttribute: () => true
    };
  });
  it("emits outOfCombatErr if not in combat", () => {
    expect(character.emit).not.toHaveBeenCalled();
    expect(strCommand()(null, character)).toBeUndefined();
    expect(character.emit).toHaveBeenCalledWith("outOfCombatErr", "strike");
  });

  it("emits alreadyErr if command is already selected", () => {
    character.combatData.decision = new Strike(character, target);
    character.isInCombat = () => true;
    expect(character.emit).not.toHaveBeenCalled();
    strCommand()(null, character)
    expect(character.emit).toHaveBeenCalledWith("alreadyErr", "strike");
  });

  it("emits commandSwitch if another command is selected", () => {
    character.combatData.decision = new Guard(character, target);
    character.isInCombat = () => true;
    expect(character.emit).not.toHaveBeenCalled();
    strCommand()(null, character)
    expect(character.emit).toHaveBeenCalledWith("commandSwitch");
  });

  it("emits msgPrepareCommand if another command is selected", () => {
    character.isInCombat = () => true;
    expect(character.emit).not.toHaveBeenCalled();
    strCommand()(target, character)
    expect(character.emit).toHaveBeenCalledTimes(2)
    expect(character.emit).toHaveBeenCalledWith("msgPrepareCmd", "strike");
    expect(character.emit).toHaveBeenCalledWith("prepareCmd", "strike", target);
  }); 

  it("will auto fill with tuple target when no target is defined", () => {
    character.isInCombat = () => true;
    const engagement = new Engagement(character)
    expect(character.combatData.tuples).toHaveLength(1)
    expect(character.emit).not.toHaveBeenCalled();
    strCommand()(null, character)
    expect(character.emit).toHaveBeenCalledTimes(2)
    expect(character.emit).toHaveBeenCalledWith("msgPrepareCmd", "strike");
    expect(character.emit).toHaveBeenCalledWith("prepareCmd", "strike", target);
  });
});
