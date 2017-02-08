'use strict';
const Attribute = require('./Attribute');

class Attributes extends Map
{
  constructor(attributes = {}) {
    super();

    // Rehydrate or create new attributes.
    for (let [name, value] of Object.entries(attributes)) {
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

  clearDeltas() {
    for (let [_, attr] of this) {
      attr.setDelta(0);
    }
  }

}

module.exports = Attributes;
