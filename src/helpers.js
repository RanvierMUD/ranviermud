'use strict';


/*
 * Generic utility funcs.
 */

/*
 * Takes an array and a thing and tells you if the thing is in the array.
 */
const has = (collection, thing) => collection.indexOf(thing) !== -1;

/**
 * Takes an object and returns an array of all of its values.
 * @param  Obj
 * @return Array of values
 */

const values = obj => {
  let vals = [];
  for (const key in obj) {
    if (obj.hasOwnProperty(key)){
      vals.push(obj[key]);
    }
  }
  return vals;
}

module.exports = {
  has, values,
};
