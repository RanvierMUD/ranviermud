'use strict';

/**
 * This is an _example_ implementation of a base player class. This, along with
 * CommandParser is one of the few core classes Ranvier encourages you to
 * modify if you want more functionality. Almost all other features can be
 * overridden in bundles.
 */
class PlayerClass {
  /**
   * @param {string} id  id corresponding to classes/<id>.js file
   * @param {object} config Definition, this object is completely arbitrary. In
   *     this example implementation it has a name, description, and ability
   *     table. You are free to change this class as you wish
   */
  constructor(id, config) {
    this.id = id;
    this.config = config;
  }

  /**
   * Table of level: abilities learned.
   * Example:
   *     {
   *       1: { skills: ['kick'] },
   *       2: { skills: ['bash'], spells: ['fireball']},
   *       5: { skills: ['rend', 'secondwind'] },
   *     }
   * @return {Object<number, Array<string>>}
   */
  get abilityTable() {
    return this.config.abilityTable;
  }

  get abilityList() {
    return Object.entries(this.abilityTable).reduce((acc, [ , abilities ]) => {
      return acc.concat(abilities.skills || []).concat(abilities.spells || []);
    }, []);
  }

  /**
   * Get a flattened list of all the abilities available to a given player
   * @param {Player} player
   * @return {Array<string>} Array of ability ids
   */
  getAbilitiesForPlayer(player) {
    let totalAbilities = [];
    Object.entries(this.abilityTable).every(([level, abilities]) => {
      if (level > player.level) {
        return false;
      }
      return totalAbilities = totalAbilities.concat(abilities.skills || []).concat(abilities.spells || []);
    });
    return totalAbilities;
  }

  hasAbility(id) {
    return this.abilityList.includes(id);
  }

  /**
   * Check if a player can use a given ability
   * @param {Player} player
   * @param {string} abilityId
   * @return {boolean}
   */
  canUseAbility(player, abilityId) {
    return this.getAbilitiesForPlayer(player).includes(abilityId);
  }
}

module.exports = PlayerClass;
