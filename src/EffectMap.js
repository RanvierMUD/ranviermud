'use strict';

class EffectMap {
  constructor(target) {
    this.effects = new Map();
    this.target = target;
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

  delete(key) {
    if (this.effects.has(key)) {
      this.effects.get(key).deactivate();
      this.effects.delete(key);
    }
  }

  validateEffects() {
    for (const [ id, effect ] of this.effects) {
      if (!effect.validate()) {
        this.delete(id);
      }
    }
  }

  /**
   * Does the work of actaully applying attribute modification
   * Currently does not allow attrs to go negative
   * @param {string} attr
   */
  evaluateAttribute(attr) {
    this.validateEffects();

    let attrValue = this.target.getRawAttribute(attr) || 0;
    for (const [ id, effect] of this.effects) {
      const modifier = effect.getModifiers()[attr];
      if (!modifier) {
        continue;
      }

      attrValue = modifier(attrValue);
    }

    return Math.max(attrValue, 0) || 0;
  }

  serialize() {
    let flattened = [];
    for (const [id, effect] of this.effects) {
      flattened.push([id, effect.flatten()]);
    }

    return flattened;
  }
}

module.exports = EffectMap;
