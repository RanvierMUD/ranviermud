'use strict';

/**
 * Used by the core skills to differentiate between passive and active skills.
 * @enum {Symbol}
 */
const SkillFlag = {
  PASSIVE: Symbol("PASSIVE"),
  ACTIVE: Symbol("ACTIVE"),
};

module.exports = SkillFlag;
