'use strict';

/**
 * Keeps track of all the individual mobs in the game
 */
class MobManager {
  constructor() {
    this.mobs = new Map();
  }

  /**
   * @param {Mob} mob
   */
  addMob(mob) {
    this.mobs.set(mob.uuid, mob);
  }

  /**
   * @param {Mob} mob
   */
  removeMob(mob) {
    this.mobs.delete(mob.uuid);
  }
}

module.exports = MobManager;
