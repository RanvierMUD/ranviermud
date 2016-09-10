'use strict';

const util = require('util');

/*
 * Generic utility funcs.
 */

/*
 * Takes an array or string and a thing and tells you if the thing is in the array or string.
 */
const has    = (collection, thing) => collection.indexOf(thing) !== -1;
const hasNot = (collection, thing) => !has(collection, thing);

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

const toArray = thing => [].concat(thing);

/**
 * Does the object have an array of keys?
 */
const hasKeys = obj => !!Object.keys(obj).length;

const tail = [first, ...rest] => rest;
const head = [first, ...rest] => first;

/**
 * Pads leftly.
 */
const leftPad = (amt, pad) => {
  pad = pad || '';
  let padding = '';
  while (amt) {
    padding += pad;
    amt--;
  }
  return padding;
}

/*
 * Takes a constructor and a value and tells you if the thing is an instance of the constructor.
 */
const is = (typeclass, thing) => thing ? thing instanceof typeclass : false;

/*
 * Shortcut for reducing all the values of an object to a single value.
 * Makes parsing objects a bit more functional.
 */
const reduceValues = (obj, callback, starter) => values(obj).reduce(callback, starter);

/*
 * Gets the first word of a string.
 * For parsing command args.
 */
const firstWord = args => splitArgs(args)[0];

/*
 * Splits a string into an array of words.
 * For parsing command args.
 */
const splitArgs = args => args.toLowerCase ?
  args.toLowerCase().split(' ') :
  null;

/**
 * Allows you to set min and max range for a number.
 * Mostly for preventing semi-random results from getting wacky.
 * Usage:
 * // Returns a number guaranteed to be between 0 and 100 inclusive but probably tending toward 100.
 * const arbitraryWithinBounds = setBounds(0, 100);
 * const arbitrarySmallNumber = arbitraryWithinBounds(Math.random() * 1000);
 * @param Number minimum bound
 * @param Number maximum bound
 * @return Function boundsChecker
 *   @param stat Number
 *   @return Number stat, unless stat is out of bounds, then it will be the nearest bound.
 */
const setBounds = (min, max) => stat =>
  Math.max(Math.min(max, stat), min);

module.exports = {
  has,       hasNot,
  firstWord, splitArgs,
  hasKeys,   leftPad,
  values,    reduceValues,
  setBounds, is,
  toArray,
  tail,      head
};
