'use strict';

const expect = require('chai').expect;
const sinon  = require('sinon');

const Random = require('../../src/random.js').Random;
const Player = require('../../src/player.js').Player;
const Npc    = require('../../src/npcs.js').Npc;
const Type   = require('../../src/type.js').Type;

Type.config(Player, Npc);

const CombatUtil   = require('../../src/combat_util.js').CombatUtil;
const CombatHelper = require('../../src/combat_util.js').CombatHelper;

describe('Player/NPC Combat Helper', () => {
  const testPlayer = new Player();

  it('should create a new instance', () => {
    expect(testPlayer.combat instanceof CombatHelper).to.be.true;
  });

  describe('combat modifiers: speed', () => {
    const baseSpeed = 10750;

    it('should be able to add and remove modifiers', () => {
      testPlayer.combat.addSpeedMod({
        name:   'haste',
        effect: speed => speed / 2
      });
      const numberOfSpeedMods = Object.keys(testPlayer.speedMods).length;
      expect(numberOfSpeedMods).to.equal(1);
    });

    //TODO: Add new tests since mods were altered to be somewhat more random-y.

  });

  describe('weapon/damage helpers', () => {
    const sword = {
      getAttribute: () => '5-40',
      getShortDesc: () => 'Yey'
    };
    const warrior = Object.assign(new Player(), {
      getEquipped:  () => sword,
      getAttribute: () => 1,
    });

    const testWarrior = new CombatHelper(warrior);

    it('should be able to get damage within a range', () => {
      let i = 0;
      let limit = 100;
      while(i < limit) {
        const damage = testWarrior.getDamage();
        expect(damage >= 5).to.be.true;
        expect(damage <= 41).to.be.true;
        i++;
      }
    });

    it('should also be able to use modifiers', () => {
      testWarrior.addDamageMod({
        name:  'berserk',
        effect: damage => damage * 2
      });

      let i = 0;
      let limit = 100;
      while(i < limit) {
        const damage = testWarrior.getDamage();
        expect(damage >= 10).to.be.true;
        expect(damage <= 82).to.be.true;
        i++;
      }

    });

    describe('weapon helpers', () => {

      it('should be able to get weapon desc', () => {
        const attackName = testWarrior.getPrimaryAttackName();
        expect(attackName).to.equal('Yey');
      });

    });

  });

});
