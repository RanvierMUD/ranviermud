'use strict';
const Attribute = require('./Attribute');

class Attributes extends Map
{
  constructor(attributes = {}) {
    super();

    // Rehydrate or create new attributes.
    for (let [name, value] of Object.entries(attributes)) {
      console.log("name:", name, "value:", value);
      if (isNaN(value)) {
        const { base, delta } = value;
        this.set(name, new Attribute(name, base, delta));
      } else {
        this.set(name, new Attribute(name, value));
      }
    }
  }

  getAttributes() {
    return this.entries();
  }

  /* Attributes are calculated by the maximum value subtracted from 
   * @param 
   * @return 
  */
  getAttribute(attr) {
    const delta = this.getDeltaKey(attr);
    return this.get(attr) + this.get(deltaKey);
  }

  incrementAttribute(attr, value) {
    const deltaKey = this.getDeltaKey(attr);
    const currentDelta = this.get(deltaKey);
    const newDelta = Math.max(0, currentDelta - value);
    this.set(deltaKey, newDelta);
  }

  decrementAttribute(attr, value) {
    this.incrementAttribute(attr, -value);
  }

  getDeltaKey(attr) {
    return `${attr}Delta`;
  }

  setBaseAttribute(attr, value) {

  }

}

module.exports = Attributes;
