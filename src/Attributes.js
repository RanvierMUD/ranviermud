'use strict';
const Attribute = require('./Attribute');

class Attributes extends Map
{
  constructor(attributes) {
    super();

    const values = Array.isArray(attributes) ? new Map(attributes) : Object.entries(attributes);
    for (let [name, value] of values) {
      if (!isNaN(value)) {
        this.set(name, new Attribute(name, value));
      } else {
        this.set(name, new Attribute(name, value.base, value.delta));
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

  serialize() {
    return [...this].map(([name, attribute]) => [name, attribute.serialize()]);
  }
}

module.exports = Attributes;
