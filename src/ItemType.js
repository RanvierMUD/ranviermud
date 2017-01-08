'use strict';

module.exports = {
  ARMOR: Symbol("ARMOR"),
  CONTAINER: Symbol("CONTAINER"),
  OBJECT: Symbol("OBJECT"),
  POTION: Symbol("POTION"),
  WEAPON: Symbol("WEAPON"),

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
