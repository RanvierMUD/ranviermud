const expect = require('chai').expect;

const Player = require('../../src/player.js').Player;
const Npc    = require('../../src/npcs.js').Npc;

const CombatUtil   = require('../../src/combat_util.js').CombatUtil;
const CombatHelper = require('../../src/combat_util.js').CombatHelper;

describe('Player/NPC Combat Helper', () => {

  it('should create a new instance', () => {
    const testPlayer = new Player();
    expect(testPlayer.combat instanceof CombatHelper).to.be.true;
  });

  it('should be able to add and remove modifiers', () => {

  });

});
