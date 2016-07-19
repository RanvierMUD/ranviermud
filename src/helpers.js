'use strict';

/*
 * Generic utility funcs.
 */

/*
 * Takes an array or string and a thing and tells you if the thing is in the array or string.
 */
const has    = (collection, thing) => collection.indexOf(thing) !== -1;
const hasNot = (collection, value) => !has(collection, value);

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

const hasKeys = obj => !!Object.keys(obj).length;

const leftPad = amt => {
  let pad = '';
  while (amt) {
    pad += ' ';
    amt--;
  }
  return pad;
}

const firstWord = args => splitArgs(args)[0];

const splitArgs = args => args.toLowerCase().split(' ');

module.exports = {
  has, values,
  hasNot, leftPad,
  firstWord, splitArgs,
  hasKeys,
};
