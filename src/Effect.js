'use strict';

const EventEmitter = require('events');

 /** @typedef EffectModifiers {{attributes: !Object<string,function>}} */
var EffectModifiers;

/**
 * @property {object}    config Effect configuration (name/desc/duration/etc.)
 * @property {boolean}   config.autoActivate If this effect immediately activates itself when added to the target
 * @property {boolean}   config.hidden       If this effect is shown in the character's effect list
 * @property {boolean}   config.stackable    If multiple effects with the same `config.type` can be applied at once
 * @property {string}    config.type         The effect category, mainly used when disallowing stacking
 * @property {boolean|number} config.tickInterval Number of seconds between calls to the `updateTick` listener
 * @property {string}    description
 * @property {number}    duration    Total duration of effect in _milliseconds_
 * @property {number}    elapsed     Get elapsed time in _milliseconds_
 * @property {string}    id     filename minus .js
 * @property {EffectModifiers} modifiers Attribute modifier functions
 * @property {string}    name
 * @property {number}    remaining Number of seconds remaining
 * @property {number}    startedAt Date.now() time this effect became active
 * @property {object}    state  Configuration of this _type_ of effect (magnitude, element, stat, etc.)
 * @property {Character} target Character this effect is... effecting
 */
class Effect extends EventEmitter {
  constructor(id, def, target) {
    super();

    this.id = id;
    this.config = Object.assign({
      autoActivate: true,
      description: 'Effect configured without description',
      duration: Infinity,
      hidden: false,
      name: 'Unnamed Effect',
      stackable: true,
      type: 'undef',
      ticketInterval: false
    }, def.config);

    this.target = target;
    this.startedAt = 0;
    this.paused = 0;
    this.modifiers = Object.assign({
      attributes: {},
    }, def.modifiers);

    // internal state saved across player load e.g., stacks, amount of damage shield remaining, whatever
    // Default state can be found in config.state
    this.state = Object.assign({}, def.state);

    // If an effect has a tickInterval it should always apply when first activated
    if (this.config.tickInterval && !this.state.tickInterval) {
      this.state.lastTick = -Infinity;
    }

    if (this.config.autoActivate) {
      this.on('effectAdded', this.activate);
    }
  }

  get name() {
    return this.config.name;
  }

  get description() {
    return this.config.description;
  }

  get duration() {
    return this.config.duration;
  }

  set duration(dur) {
    this.config.duration = dur;
  }

  /**
   * @return {number}
   */
  get elapsed () {
    if (!this.startedAt) {
      return null;
    }

    return this.paused || (Date.now() - this.startedAt);
  }

  /**
   * Get remaining time in seconds
   * @return {number}
   */
  get remaining() {
    return Math.floor((this.config.duration - this.elapsed) / 1000);
  }

  isCurrent() {
    return this.elapsed < this.config.duration;
  }

  activate() {
    if (this.active) {
      return;
    }

    this.startedAt = Date.now() - this.elapsed;
    this.emit('eventActivated');
    this.active = true;
  }

  deactivate() {
    if (!this.active) {
      return;
    }

    this.emit('eventDeactivated');
    this.active = false;
  }

  /**
   * Remove this effect from its target
   */
  remove() {
    this.emit('remove');
  }

  pause() {
    this.paused = this.elapsed;
  }

  resume() {
    this.startedAt = Date.now() - this.paused;
    this.paused = null;
  }

  /**
   * @param {string} attrName
   * @param {number} currentValue
   * @return 
   */
  modifyAttribute(attrName, currentValue) {
    const modifier = (this.modifiers.attributes[attrName] || (_ => _)).bind(this);
    return modifier(currentValue);
  }

  /**
   * @param {Damage} damage
   * @return {Damage}
   */
  modifyIncomingDamage(damage) {
    throw new Error('TODO');
  }

  /**
   * @param {Damage} damage
   * @return {Damage}
   */
  modifyOutgoingDamage(damage) {
    throw new Error('TODO');
  }

  serialize() {
    let config = Object.assign({}, this.config);
    config.duration = config.duration === Infinity ? 'inf' : config.duration;

    let state = Object.assign({}, this.state);
    // store lastTick as a difference so we can make sure to start where we left off when we hydrate
    if (state.lastTick && isFinite(state.lastTick))  {
      state.lastTick = Date.now() - state.lastTick;
    }

    return {
      id: this.id,
      elapsed: this.elapsed,
      state,
      config,
    };
  }

  hydrate(data) {
    data.config.duration = data.config.duration === 'inf' ? Infinity : data.config.duration;
    this.config = data.config;

    if (!isNaN(data.elapsed)) {
      this.startedAt = Date.now() - data.elapsed;
    }

    if (!isNaN(data.state.lastTick)) {
      data.state.lastTick = Date.now() - data.state.lastTick;
    }
    this.state = data.state;
  }
}

module.exports = Effect;

