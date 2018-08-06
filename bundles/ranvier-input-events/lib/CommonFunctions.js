'use strict';

/**
 * General functions used on the ranvier-input-events bundle
 */

const srcPath = '../../../src/'
const Config  = require(srcPath + 'Config');

/**
 * @param {string} name
 * @return {boolean}
 */
exports.validateName = function(name) {
  const maxLength = Config.get('maxAccountNameLength');
  const minLength = Config.get('minAccountNameLength');

  if (!name) {
    return 'Вы ничего не ввели.';
  }
  if (name.length > maxLength) {
    return 'Имя слишком длинное.';
  }
  if (name.length < minLength) {
    return 'Имя слишком короткое.';
  }
  if (!/^[а-я]+$/i.test(name)) {
    return 'Имя может состоять только из кириллицы.';
  }
  return false;
}
