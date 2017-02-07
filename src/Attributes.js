'use strict';

const EventEmitter = require('events');

class Attributes extends EventEmitter 
{
  constructor(attributes = {}) {
    super();
    this.attributes = new Map(Object.entries(attributes));
  }

  getAttributes() {
    return this.attributes.entries();
  }

  getAttribute(attr) {
    return this.attributes.get(attr);
  }

  setAttribute(attr, value) {
    return this.attributes.set(attr, value);
  }

  [Symbol.iterator]() {
    return this.attributes[Symbol.iterator]();
  }

}

module.exports = Attributes;
