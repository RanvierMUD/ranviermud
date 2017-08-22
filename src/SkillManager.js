'use strict';

const SkillFlag = require('./SkillFlag');

/**
 * Keeps track of registered skills
 */
class SkillManager {
  constructor() {
    this.skills = new Map();
  }

  /**
   * @param {string} skill Skill name
   * @return {Skill|undefined}
   */
  get(skill) {
    return this.skills.get(skill);
  }

  /**
   * @param {Skill} skill
   */
  add(skill) {
    this.skills.set(skill.id, skill);
  }

  /**
   * @param {Skill} skill
   */
  remove(skill) {
    this.skills.delete(skill.name);
  }

  /**
   * Find executable skills
   * @param {string}  search
   * @param {boolean} includePassive
   * @return {Skill}
   */
  find(search, includePassive = false) {
    for (const [ id, skill ] of this.skills) {
      if (!includePassive && skill.flags.includes(SkillFlag.PASSIVE)) {
        continue;
      }

      if (id.indexOf(search) === 0) {
        return skill;
      }
    }
  }
}

module.exports = SkillManager;
