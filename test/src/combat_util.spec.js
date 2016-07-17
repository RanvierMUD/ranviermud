const expect = require('chai').expect;

const Player = require('../../src/player.js').Player;
const Npc    = require('../../src/npcs.js').Npc;

const CombatUtil   = require('../../src/combat_util.js').CombatUtil;
const CombatHelper = require('../../src/combat_util.js').CombatHelper;

describe('Player/NPC Combat Helper', () => {
  const testPlayer = new Player();

  it('should create a new instance', () => {
    expect(testPlayer.combat instanceof CombatHelper).to.be.true;
  });

  it('should be able to add and remove modifiers', () => {
    testPlayer.combat.addSpeedMod({
      name:   'haste',
      effect: speed => speed / 2
    });
    const numberOfSpeedMods = Object.keys(testPlayer.combat.speedMods).length;
    expect(numberOfSpeedMods).to.equal(1);
  });

  it('should be able to apply modifiers', () => {
    const speed = testPlayer.combat.getAttackSpeed();
    const expected = 4375;
    expect(speed).to.equal(expected);
  });

  it('should stack modifiers', () => {
    testPlayer.combat.addSpeedMod({
      name: 'slow',
      effect: speed => speed * 2
    });
    const speed = testPlayer.combat.getAttackSpeed();
    const expected = 4375 * 2;
    expect(speed).to.equal(expected);
  });

  it('has a maximum for speed mod', () => {

  });

});
