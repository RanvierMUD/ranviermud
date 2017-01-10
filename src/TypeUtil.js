'use strict';

class TypeUtil {
  /**
   * Check to see if a given object adheres to a given interface by checking
   * to see if the `obj` has all of the methods in `type`
   *
   * @param {object} obj
   * @param {array} type
   * @return {boolean}
   */
  static is(obj, type) {
    for (let method of type) {
      if (!Reflect.has(obj, method)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check to see if a given object is iterable
   * @param {object} obj
   * @return {boolean}
   */
  static iterable(obj) {
    return obj && typeof obj[Symbol.iterator] === 'function';
  }
}

module.exports = TypeUtil;
