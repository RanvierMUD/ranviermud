'use strict';

const EventManager = require('./EventManager');
const Effect = require('./Effect');

/**
 * @property {Map} effects
 */
class EffectFactory {
  constructor() {
    this.effects = new Map();
  }

  add(id, config) {
    if (this.effects.has(id)) {
      return;
    }

    let definition = Object.assign({}, config);
    delete definition.listeners;
    const listeners = config.listeners;

    const eventManager = new EventManager();
    for (const event in listeners) {
      eventManager.add(event, listeners[event]);
    }

    this.effects.set(id, { definition, eventManager });
  }

  /**
   * Get a effect definition. Use `create` if you want an instance of a effect
   * @param {string} id
   * @return {object}
   */
  get(id) {
    return this.get(id);
  }

  /**
   * @param {GameState} GameState
   * @param {string}    id        effect id
   * @param {object}    config    Override configuration {@see Effect.constructor}
   * @param {Player}    target
   * @return {Effect}
   */
  create(GameState, id, config, target) {
    const entry = this.effects.get(id);
    const effect = new Effect(id, Object.assign(entry.definition, config), target);
    entry.eventManager.attach(effect);

    return effect;
  }
}

module.exports = EffectFactory;

