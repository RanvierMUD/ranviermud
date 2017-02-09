'use strict';

class EffectList {
  constructor(target, effects) {
    this.effects = new Set(effects);
    this.target = target;
  }

  get size() {
    return this.effects.size;
  }

  entries() {
    return this.effects.entries();
  }

  /**
   * Proxy events to all effects
   * @param {string} event
   * @param {...*}   args
   */
  emit(event, ...args) {
    for (const effect of this.effects) {
      effect.emit(event, ...args);
    }
  }

  set(key, effect, init) {
    if (this.effects.has(key)) {
      this.effects.get(key).removeEffect(key);
    }

    this.effects.set(key, effect);

    if (init) {
      effect.init();
    }
  }

  add(effect) {
    this.effects.add(effect);
    effect.emit('effectAdded');
    effect.on('remove', () => this.remove(effect));
  }

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
