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
    return this.effects.entries();
  }

  /**
   * Proxy an event to all effects
   * @param {string} event
   * @param {...*}   args
   */
  emit(event, ...args) {
    this.validateEffects();
    for (const effect of this.effects) {
      if (effect.paused) {
        continue;
      }

      if (effect.config.tickInterval) {
        const sinceLastTick = Date.now() - effect.state.lastTick;
        if (sinceLastTick < effect.config.tickInterval * 1000) {
          continue;
        }
        effect.state.lastTick = Date.now();
      }
      effect.emit(event, ...args);
    }
  }

  /**
   * @param {Effect} effect
   */
  add(effect) {
    for (const activeEffect of this.effects) {
      if (!activeEffect.config.stackable && effect.config.type === activeEffect.config.type) {
        return false;
      }
    }

    this.effects.add(effect);
    effect.emit('effectAdded');
    effect.on('remove', () => this.remove(effect));
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
   * @return {number}
   */
  evaluateIncomingDamage(damage) {
    this.validateEffects();

    let amount = damage.amount;

    for (const [ id, effect ] of this.effects) {
      amount = effect.modifyIncomingDamage(Damage);
    }

    return Math.max(amount, 0) || 0;
  }

  /**
   * @param {Damage} damage
   * @return {number}
   */
  evaluateOutgoingDamage(damage) {
    this.validateEffects();

    let amount = damage.amount;

    for (const [ id, effect ] of this.effects) {
      amount = effect.modifyOutgoingDamage(Damage);
    }

    return Math.max(amount, 0) || 0;
  }

  serialize() {
    this.validateEffects();
    return [...this.effects].map(effect => effect.serialize());
  }

  hydrate(state) {
    const effects = this.effects;
    this.effects = new Set();
    for (const newEffect of effects) {
      const effect = state.EffectFactory.create(newEffect.id, this.target);
      effect.hydrate(newEffect);
      this.add(effect);
    }
  }
}

module.exports = EffectList;
