'use strict';

const expect = require('chai').expect;
const sinon  = require('sinon');
const Player = require('../../src/player').Player;
const Npc    = require('../../src/npcs').Npc;

const Effect = require('../../src/effect').Effect;

describe('Effect class', () => {

  describe('Construction & Validation', () => {

    it('Should create an instance of an Effect, given proper params', () => {
      const target = new Player({});
      const effect = new Effect({
        target, 
        id: 'id', 
        type: 'some_effect',
        options: { duration: 100000 }
      });
      expect(effect instanceof Effect).to.be.true;

    });

  });

});