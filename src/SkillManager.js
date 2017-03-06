'use strict';

const SkillFlag = require('./SkillFlag');

class SkillManager {
  constructor() {
    this.skills = new Map();
  }

  get(skill) {
    return this.skills.get(skill);
  }

  add(skill) {
    this.skills.set(skill.id, skill);
  }

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

