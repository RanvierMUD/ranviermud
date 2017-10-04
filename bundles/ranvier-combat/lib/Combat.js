'use strict';

const Damage = require('../../../src/Damage');
const Logger = require('../../../src/Logger');
const RandomUtil = require('../../../src/RandomUtil');
const CombatErrors = require('./CombatErrors');
const Parser = require('../../../src/CommandParser').CommandParser;

/**
 * This class is an example implementation of a Diku-style real time combat system. Combatants
 * attack and then have some amount of lag applied to them based on their weapon speed and repeat.
 */
class Combat {
  /**
   * Handle a single combat round for a given attacker
   * @param {GameState} state
   * @param {Character} attacker
   * @return {boolean}  true if combat actions were performed this round
   */
  static updateRound(state, attacker) {
    if (attacker.getAttribute('health') <= 0) {
      Combat.handleDeath(state, attacker);
      return false;
    }

    if (!attacker.isInCombat()) {
      if (!attacker.isNpc) {
        attacker.removePrompt('combat');
      }
      return false;
    }

    let lastRoundStarted = attacker.combatData.roundStarted;
    attacker.combatData.roundStarted = Date.now();

    // cancel if the attacker's combat lag hasn't expired yet
    if (attacker.combatData.lag > 0) {
      const elapsed = Date.now() - lastRoundStarted;
      attacker.combatData.lag -= elapsed;
      return false;
    }

    // currently just grabs the first combatant from their list but could easily be modified to
    // implement a threat table and grab the attacker with the highest threat
    let target = null;
    try {
      target = Combat.chooseCombatant(attacker);
    } catch (e) {
      attacker.removeFromCombat();
      attacker.combatData = {};
      throw e;
    }

    // no targets left, remove attacker from combat
    if (!target) {
      attacker.removeFromCombat();
      // reset combat data to remove any lag
      attacker.combatData = {};
      return false;
    }

    Combat.makeAttack(attacker, target);
    return true;
  }

  /**
   * Find a target for a given attacker
   * @param {Character} attacker
   * @return {Character|null}
   */
  static chooseCombatant(attacker) {
    if (!attacker.combatants.size) {
      return null;
    }

    for (const target of attacker.combatants) {
      if (!target.hasAttribute('health')) {
        throw new CombatErrors.CombatInvalidTargetError();
      }
      if (target.getAttribute('health') > 0) {
        return target;
      }
    }

    return null;
  }

  /**
   * Actually apply some damage from an attacker to a target
   * @param {Character} attacker
   * @param {Character} target
   */
  static makeAttack(attacker, target) {
    const amount = this.calculateWeaponDamage(attacker);
    const damage = new Damage({ attribute: 'health', amount, attacker });
    damage.commit(target);

    if (target.getAttribute('health') <= 0) {
      target.combatData.killedBy = attacker;
    }

    // currently lag is really simple, the character's weapon speed = lag
    attacker.combatData.lag = this.getWeaponSpeed(attacker) * 1000;
  }

  /**
   * Any cleanup that has to be done if the character is killed
   * @param {Character} deadEntity
   * @param {?Character} killer Optionally the character that killed the dead entity
   */
  static handleDeath(state, deadEntity, killer) {
    deadEntity.removeFromCombat();

    killer = killer || deadEntity.combatData.killedBy;
    Logger.log(`${killer ? killer.name : 'Something'} killed ${deadEntity.name}.`);


    if (killer) {
      killer.emit('deathblow', deadEntity);
    }
    deadEntity.emit('killed', killer);

    if (deadEntity.isNpc) {
      state.MobManager.removeMob(deadEntity);
      deadEntity.room.area.removeNpc(deadEntity);
    }
  }

  static startRegeneration(state, entity) {
    if (entity.hasEffectType('regen')) {
      return;
    }

    let regenEffect = state.EffectFactory.create('regen', entity, { hidden: true }, { magnitude: 15 });
    if (entity.addEffect(regenEffect)) {
      regenEffect.activate();
    }
  }

  /**
   * @param {string} args
   * @param {Player} player
   * @return {Entity|null} Found entity... or not.
   */
  static findCombatant(attacker, search) {
    if (!search.length) {
      return null;
    }

    let possibleTargets = [...attacker.room.npcs];
    if (attacker.getMeta('pvp')) {
      possibleTargets = [...possibleTargets, ...attacker.room.players];
    }

    const target = Parser.parseDot(search, possibleTargets);

    if (!target) {
      return null;
    }

    if (target === attacker) {
      throw new CombatErrors.CombatSelfError("You smack yourself in the face. Ouch!");
    }

    if (!target.hasAttribute('health')) {
      throw new CombatErrors.CombatInvalidTargetError("You can't attack that target");
    }

    if (!target.isNpc && !target.getMeta('pvp')) {
      throw new CombatErrors.CombatNonPvpError(`${target.name} has not opted into PvP.`, target);
    }

    if (target.pacifist) {
      throw new CombatErrors.CombatPacifistError(`${target.name} is a pacifist and will not fight you.`, target);
    }

    return target;
  }

  /**
   * Generate an amount of weapon damage
   * @param {Character} attacker
   * @param {boolean} average Whether to find the average or a random between min/max
   * @return {number}
   */
  static calculateWeaponDamage(attacker, average = false) {
    let weaponDamage = this.getWeaponDamage(attacker);
    let amount = 0;
    if (average) {
      amount = (weaponDamage.min + weaponDamage.max) / 2;
    } else {
      amount = RandomUtil.inRange(weaponDamage.min, weaponDamage.max);
    }

    return this.normalizeWeaponDamage(attacker, amount);
  }

  /**
   * Get the damage of the weapon the character is wielding
   * @param {Character} attacker
   * @return {{max: number, min: number}}
   */
  static getWeaponDamage(attacker) {
    const weapon = attacker.equipment.get('wield');
    let min = 0, max = 0;
    if (weapon) {
      min = weapon.properties.minDamage;
      max = weapon.properties.maxDamage;
    }

    return {
      max,
      min
    };
  }

  /**
   * Get the speed of the currently equipped weapon
   * @param {Character} attacker
   * @return {number}
   */
  static getWeaponSpeed(attacker) {
    let speed = 2.0;
    const weapon = attacker.equipment.get('wield');
    if (!attacker.isNpc && weapon) {
      speed = weapon.properties.speed;
    }

    return speed;
  }

  /**
   * Get a damage amount adjusted by attack power/weapon speed
   * @param {Character} attacker
   * @param {number} amount
   * @return {number}
   */
  static normalizeWeaponDamage(attacker, amount) {
    let speed = this.getWeaponSpeed(attacker);
    amount += attacker.hasAttribute('strength') ? attacker.getAttribute('strength') : attacker.level;
    return Math.round(amount / 3.5 * speed);
  }
}

module.exports = Combat;
