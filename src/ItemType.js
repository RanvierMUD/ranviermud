'use strict';

/**
 * @enum {Symbol}
 */
const ItemType = {
  ARMOR: Symbol("ARMOR"),
  CONTAINER: Symbol("CONTAINER"),
  OBJECT: Symbol("OBJECT"),
  POTION: Symbol("POTION"),
  WEAPON: Symbol("WEAPON"),
  RESOURCE: Symbol("RESOURCE"),
};

module.exports = ItemType;
