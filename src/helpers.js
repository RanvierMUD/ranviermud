/*
 * Generic utility funcs.
 */

/*
 * Takes an array and a thing and tells you if the thing is in the array.
 */
const has = (collection, thing) => collection.indexOf(thing) !== -1;


module.exports = {
  has,
};
