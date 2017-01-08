'use strict';

module.exports = {
  ARMOR: 1,
  CONTAINER: 2,
  OBJECT: 1,
  POTION: 5,
  WEAPON: 4,

  /**
   * Change a string of a type into an actual constant
   * @param {string} typeString
   * @return {ItemType}
   */
  resolve: function (typeString) {
    return ({
      'OBJECT': this.OBJECT,
      'CONTAINER': this.CONTAINER,
      'ARMOR': this.ARMOR,
      'WEAPON': this.WEAPON,
      'POTION': this.POTION,
    })[typeString];
  }
};
