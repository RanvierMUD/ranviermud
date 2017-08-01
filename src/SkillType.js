'use strict';

/**
 * Used by the core to differentiate between skills and spells.
 * @enum {Symbol}
 */
const SkillType = {
  SKILL: Symbol("SKILL"),
  SPELL: Symbol("SPELL"),
};

module.exports = SkillType;
