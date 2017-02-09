'use strict';

const EventEmitter = require('events');

/**
 * @property {string}    id     filename minus .js
 * @property {object}    def    Effect definition
 * @property {Character} target Character this effect is... effecting
 * @property {object}    config
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

  get elapsed () {
    if (!this.startedAt) {
      return null;
    }

    return this.paused || (Date.now() - this.startedAt);
  }

  get remaining() {
    return Math.floor((this.config.duration - this.elapsed) / 1000);
  }

  isCurrent() {
    return this.elapsed < this.config.duration;
  }

  activate() {
    this.startedAt = Date.now() - this.elapsed;
    this.emit('eventActivated');
  }

  deactivate() {
    this.emit('eventDeactivated');
  }

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

    return {
      id: this.id,
      elapsed: this.elapsed,
      state: this.state,
      config,
    };
  }

  hydrate(data) {
    data.config.duration = data.config.duration === 'inf' ? Infinity : data.config.duration;
    this.config = data.config;

    if (!isNaN(data.elapsed)) {
      this.startedAt = Date.now() - data.elapsed;
    }
    this.state = data.state;
  }
}

module.exports = Effect;

