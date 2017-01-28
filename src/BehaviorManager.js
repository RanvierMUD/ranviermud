'use strict';

const TypeUtil = require('./TypeUtil');
const EventManager = require('./EventManager');

/**
 * BehaviorManager keeps a map of BehaviorName:EventManager which is used
 * during Item and NPC hydrate() methods to attach events
 */
class BehaviorManager {
  constructor() {
    this.behaviors = new Map();
  }

  /**
   * Get EventManager for a given behavior
   * @param {string} name
   * @return {EventManager}
   */
  get(name) {
    return this.behaviors.get(name);
  }

  /**
   * Check to see if a behavior exists
   * @param {string} name
   * @return {boolean}
   */
  has(name) {
    return this.behaviors.has(name);
  }

  /**
   * @param {string}   behaviorName
   * @param {Function} listener
   */
  addListener(behaviorName, event, listener) {
    if (!this.behaviors.has(behaviorName)) {
      this.behaviors.set(behaviorName, new EventManager());
    }

    this.behaviors.get(behaviorName).add(event, listener);
  }
}

module.exports = BehaviorManager;
