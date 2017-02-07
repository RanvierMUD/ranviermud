'use strict';


class Attributes extends Map
{
  constructor(attributes = {}) {
    super(Object.entries(attributes));
  }

  getAttributes() {
    return this.entries();
  }

}

module.exports = Attributes;
