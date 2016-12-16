'use strict';

const expect = require('chai').expect;
const sinon  = require('sinon');
const Player = require('../../src/player').Player;
const Npc    = require('../../src/npcs').Npc;

const Effect = require('../../src/effect').Effect;

describe('Effect class', () => {

  const target = new Player({});
  const defaultOpts = {
    target, 
    id: 'id', 
    type: 'some_effect',
    options: { duration: 100000 }
  };

  describe('Construction & Validation', () => {


    it('Should create an instance of an Effect, given proper params', () => {
      const effect = new Effect(defaultOpts);
      
      expect(effect instanceof Effect).to.be.true;
    });

    it('should not create an Effect without a valid target', () => {
      const createBadEffect = () => {
        return new Effect(Object.assign({}, defaultOpts, { target: 'lol' }));
      }
      expect(createBadEffect).to.throw(TypeError);
    });

    it('should not create an Effect without an id to prevent stacking', () => {
      const createBadEffect = () => {
        return new Effect(Object.assign({}, defaultOpts, { id: null }));
      }
      expect(createBadEffect).to.throw(ReferenceError);
    });


    it('should not create an Effect without a generic effect type to pull from Effects table', () => {
      const createBadEffect = () => {
        return new Effect(Object.assign({}, defaultOpts, { type: null }));
      }
      expect(createBadEffect).to.throw(ReferenceError);
    });


    it('should not create an Effect without an options object to pass to Effects methods', () => {
      const createBadEffect = () => {
        return new Effect(Object.assign({}, defaultOpts, { options: null }));
      }
      expect(createBadEffect).to.throw(ReferenceError);
    });

  });

  describe('Getters for required stuff', () => {
    it('should have everything', () => {
      const effect = new Effect(defaultOpts);
      expect(effect.getId()).to.equal('id');
      expect(effect.getOptions()).to.eql({ duration: 100000 });
      expect(effect.getType()).to.equal('some_effect');
      expect(effect.getTarget()).to.eql(target);
    })
  });

  describe('Getters for options', () => {
    
  });

});