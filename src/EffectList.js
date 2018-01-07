'use strict';

/**
 * Self-managing list of effects for a target
 * @property {Set}    effects
 * @property {number} size Number of currently active effects
 * @property {Character} target
 */
class EffectList {
  /**
   * @param {Character} target
   * @param {Array<Object|Effect>} effects array of serialized effects (Object) or actual Effect instances
   */
  constructor(target, effects) {
    this.effects = new Set(effects);
    this.target = target;
  }

  /**
   * @type {number}
   */
  get size() {
    this.validateEffects();
    return this.effects.size;
  }

  /**
   * Get current list of effects as an array
   * @return {Array<Effect>}
   */
  entries() {
    this.validateEffects();
    return [...this.effects];
  }

  /**
   * @param {string} type
   * @return {boolean}
   */
  hasEffectType(type) {
    return !!this.getByType(type);
  }

  /**
   * @param {string} type
   * @return {Effect}
   */
  getByType(type) {
    return [...this.effects].find(effect => {
      return effect.config.type === type;
    });
  }

  /**
   * Proxy an event to all effects
   * @param {string} event
   * @param {...*}   args
   */
  emit(event, ...args) {
    this.validateEffects();
    if (event === 'effectAdded' || event === 'effectRemoved') {
      // don't forward these events on from the player as it would cause confusion between Character#effectAdded
      // and Effect#effectAdded. The former being when any effect gets added to a character, the later is fired on
      // an effect when it is added to a character
      return;
    }

    for (const effect of this.effects) {
      if (effect.paused) {
        continue;
      }

      if (event === 'updateTick' && effect.config.tickInterval) {
        const sinceLastTick = Date.now() - effect.state.lastTick;
        if (sinceLastTick < effect.config.tickInterval * 1000) {
          continue;
        }
        effect.state.lastTick = Date.now();
        effect.state.ticks++;
      }
      effect.emit(event, ...args);
    }
  }

  /**
   * @param {Effect} effect
   * @fires Effect#effectAdded
   */
  add(effect) {
    for (const activeEffect of this.effects) {
      if (effect.config.type === activeEffect.config.type) {
        if (activeEffect.config.maxStacks && activeEffect.state.stacks < activeEffect.config.maxStacks) {
          activeEffect.state.stacks = Math.min(activeEffect.config.maxStacks, activeEffect.state.stacks + 1);

          /**
           * @event Effect#effectStackAdded
           * @param {Effect} effect The new effect that is trying to be added
           */
          activeEffect.emit('effectStackAdded', effect);
          return true;
        }

        if (activeEffect.config.refreshes) {
          /**
           * @event Effect#effectRefreshed
           * @param {Effect} effect The new effect that is trying to be added
           */
          activeEffect.emit('effectRefreshed', effect);
          return true;
        }

        if (activeEffect.config.unique) {
          return false;
        }
      }
    }

    this.effects.add(effect);

    /**
     * @event Effect#effectAdded
     */
    effect.emit('effectAdded');
    /**
     * @event Character#effectAdded
     */
    this.target.emit('effectAdded', effect);
    effect.on('remove', () => this.remove(effect));
    return true;
  }

  /**
   * Deactivate and remove an effect
   * @param {Effect} effect
   * @throws ReferenceError
   */
  remove(effect) {
    if (!this.effects.has(effect)) {
      throw new ReferenceError("Trying to remove effect that was never added");
    }

    effect.deactivate();
    this.effects.delete(effect);
    /**
     * @event Character#effectRemoved
     */
    this.target.emit('effectRemoved');
  }

  /**
   * Ensure effects are still current and if not remove them
   */
  validateEffects() {
    for (const effect of this.effects) {
      if (!effect.isCurrent()) {
        this.remove(effect);
      }
    }
  }

  /**
   * Gets the effective "max" value of an attribute (before subtracting delta).
   * Does the work of actaully applying attribute modification
   * @param {Atrribute} attr
   * @return {number}
   */
  evaluateAttribute(attr) {
    this.validateEffects();

    let attrName  = attr.name;
    let attrValue = attr.base || 0;

    for (const effect of this.effects) {
      if (effect.paused) {
        continue;
      }
      attrValue = effect.modifyAttribute(attrName, attrValue);
    }

    return Math.max(attrValue, 0) || 0;
  }

  /**
   * @param {Damage} damage
   * @param {number} currentAmount
   * @return {number}
   */
  evaluateIncomingDamage(damage, currentAmount) {
    this.validateEffects();

    for (const effect of this.effects) {
      currentAmount = effect.modifyIncomingDamage(damage, currentAmount);
    }

    return Math.max(currentAmount, 0) || 0;
  }

  /**
   * @param {Damage} damage
   * @param {number} currentAmount
   * @return {number}
   */
  evaluateOutgoingDamage(damage, currentAmount) {
    this.validateEffects();

    for (const effect of this.effects) {
      currentAmount = effect.modifyOutgoingDamage(damage, currentAmount);
    }

    return Math.max(currentAmount, 0) || 0;
  }

  serialize() {
    this.validateEffects();
    let serialized = [];
    for (const effect of this.effects) {
      if (!effect.config.persists) {
        continue;
      }

      serialized.push(effect.serialize());
    }

    return serialized;
  }

  hydrate(state) {
    const effects = this.effects;
    this.effects = new Set();
    for (const newEffect of effects) {
      const effect = state.EffectFactory.create(newEffect.id, this.target);
      effect.hydrate(state, newEffect);
      this.add(effect);
    }
  }
}

module.exports = EffectList;
