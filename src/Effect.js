'use strict';

const EventEmitter = require('events');

 /** @typedef EffectModifiers {{attributes: !Object<string,function>}} */
var EffectModifiers;

/**
 * See the {@link http://ranviermud.com/extending/effects/|Effect guide} for usage.
 * @property {object}  config Effect configuration (name/desc/duration/etc.)
 * @property {boolean} config.autoActivate If this effect immediately activates itself when added to the target
 * @property {boolean} config.hidden       If this effect is shown in the character's effect list
 * @property {boolean} config.unique       If multiple effects with the same `config.type` can be applied at once
 * @property {number}  config.maxStacks    When adding an effect of the same type it adds a stack to the current
 *     effect up to maxStacks instead of adding the effect. Implies `config.unique`
 * @property {boolean} config.persists     If false the effect will not save to the player
 * @property {string}  config.type         The effect category, mainly used when disallowing stacking
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
 * @extends EventEmitter
 *
 * @listens Effect#effectAdded
 */
class Effect extends EventEmitter {
  constructor(id, def, target) {
    super();

    this.id = id;
    this.flags = def.flags || [];
    this.config = Object.assign({
      autoActivate: true,
      description: '',
      duration: Infinity,
      hidden: false,
      maxStacks: 0,
      name: 'Unnamed Effect',
      persists: true,
      tickInterval: false,
      type: 'undef',
      unique: true,
    }, def.config);

    this.target = target;
    this.startedAt = 0;
    this.paused = 0;
    this.modifiers = Object.assign({
      attributes: {},
      incomingDamage: (damage, current) => current,
      outgoingDamage: (damage, current) => current,
    }, def.modifiers);

    // internal state saved across player load e.g., stacks, amount of damage shield remaining, whatever
    // Default state can be found in config.state
    this.state = Object.assign({}, def.state);

    // If an effect has a tickInterval it should always apply when first activated
    if (this.config.tickInterval && !this.state.tickInterval) {
      this.state.lastTick = -Infinity;
      this.state.ticks = 0;
    }

    if (this.config.autoActivate) {
      this.on('effectAdded', this.activate);
    }
  }

  /**
   * @type {string}
   */
  get name() {
    return this.config.name;
  }

  /**
   * @type {string}
   */
  get description() {
    return this.config.description;
  }

  /**
   * @type {number}
   */
  get duration() {
    return this.config.duration;
  }

  set duration(dur) {
    this.config.duration = dur;
  }

  /**
   * Elapsed time in milliseconds since event was activated
   * @type {number}
   */
  get elapsed () {
    if (!this.startedAt) {
      return null;
    }

    return this.paused || (Date.now() - this.startedAt);
  }

  /**
   * Remaining time in seconds
   * @type {number}
   */
  get remaining() {
    return this.config.duration - this.elapsed;
  }

  /**
   * Whether this effect has lapsed
   * @return {boolean}
   */
  isCurrent() {
    return this.elapsed < this.config.duration;
  }

  /**
   * Set this effect active
   * @fires Effect#effectActivated
   */
  activate() {
    if (this.active) {
      return;
    }

    this.startedAt = Date.now() - this.elapsed;
    /**
     * @event Effect#effectActivated
     */
    this.emit('effectActivated');
    this.active = true;
  }

  /**
   * Set this effect active
   * @fires Effect#effectDeactivated
   */
  deactivate() {
    if (!this.active) {
      return;
    }

    /**
     * @event Effect#effectDeactivated
     */
    this.emit('effectDeactivated');
    this.active = false;
  }

  /**
   * Remove this effect from its target
   * @fires Effect#remove
   */
  remove() {
    /**
     * @event Effect#remove
     */
    this.emit('remove');
  }

  /**
   * Stop this effect from having any effect temporarily
   */
  pause() {
    this.paused = this.elapsed;
  }

  /**
   * Resume a paused effect
   */
  resume() {
    this.startedAt = Date.now() - this.paused;
    this.paused = null;
  }

  /**
   * @param {string} attrName
   * @param {number} currentValue
   * @return {number} attribute modified by effect
   */
  modifyAttribute(attrName, currentValue) {
    let modifier = _ => _;
    if (typeof this.modifiers.attributes === 'function') {
      modifier = (current) => {
        return this.modifiers.attributes.bind(this)(attrName, current);
      };
    } else if (attrName in this.modifiers.attributes) {
      modifier = this.modifiers.attributes[attrName];
    }
    return modifier.bind(this)(currentValue);
  }

  /**
   * @param {Damage} damage
   * @param {number} currentAmount
   * @return {Damage}
   */
  modifyIncomingDamage(damage, currentAmount) {
    const modifier = this.modifiers.incomingDamage.bind(this);
    return modifier(damage, currentAmount);
  }

  /**
   * @param {Damage} damage
   * @param {number} currentAmount
   * @return {Damage}
   */
  modifyOutgoingDamage(damage, currentAmount) {
    const modifier = this.modifiers.outgoingDamage.bind(this);
    return modifier(damage, currentAmount);
  }

  /**
   * Gather data to persist
   * @return {Object}
   */
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
      skill: this.skill && this.skill.id,
      state,
      config,
    };
  }

  /**
   * Reinitialize from persisted data
   * @param {GameState}
   * @param {Object} data
   */
  hydrate(state, data) {
    data.config.duration = data.config.duration === 'inf' ? Infinity : data.config.duration;
    this.config = data.config;

    if (!isNaN(data.elapsed)) {
      this.startedAt = Date.now() - data.elapsed;
    }

    if (!isNaN(data.state.lastTick)) {
      data.state.lastTick = Date.now() - data.state.lastTick;
    }
    this.state = data.state;

    if (data.skill) {
      this.skill = state.SkillManager.get(data.skill) || state.SpellManager.get(data.skill);
    }
  }
}

module.exports = Effect;
