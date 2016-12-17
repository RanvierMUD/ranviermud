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
    
    describe('Duration option', () => {

      it('should be set to Infinity by default', () => {
        const effect = new Effect(Object.assign({}, defaultOpts, { options: { burrito: true } }));
        expect(effect.getDuration()).to.equal(Infinity)
      });

      it('should otherwise just get the duration', () => {
        const effect = new Effect(defaultOpts);
        expect(effect.getDuration()).to.equal(100000);
      });

      it('should be able to parse strings that are numeric', () => {
        const effect = new Effect(Object.assign({}, defaultOpts, { options: { duration: '100ms' } }));
        expect(effect.getDuration()).to.equal(100);
      });

      it('non-numeric, non parseable duration options should be set to default', () => {
        const effect = new Effect(Object.assign({}, defaultOpts, { options: { duration: 'potatos' } }));
        expect(effect.getDuration()).to.equal(Infinity);  
      });

    });

  });

  describe('Keeping track of time', () => {

    describe('in permanent effects', () => {
      const effect = new Effect(Object.assign({}, defaultOpts, { options: { multiplier: 2 } }));

      it('should return null if the effect is permanent', () => {
        expect(effect.getElapsed()).to.be.null;
      });

      it('should tell us if the effect has a time limit or not...', () => {
        expect(effect.isTemporary()).to.be.false;
      });
    });
    
    describe('in temporary effects', () => {

      let clock = null;
        
      beforeEach(() => {
        clock = sinon.useFakeTimers();
      });

      afterEach(() => {
        clock.restore();
      });
      
      const effect = new Effect(defaultOpts);
      
      it('should otherwise return the amount of time that has lapsed since the effect was instantiated', () => {
        clock.tick(200);
        expect(effect.getElapsed()).to.equal(200);
      });

      it('should tell us that the effect will wear off eventually', () => {
        expect(effect.isTemporary()).to.be.true;
      });

      it('should tell us the effect should be removed', () => {
        expect(effect.isFinished()).to.be.false;
      });
    
    });

  });

});