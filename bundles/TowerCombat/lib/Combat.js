"use strict";

const { Random } = require("rando-js");
const { Damage, Logger, Broadcast: B } = require("ranvier");
const Parser = require("../../bundle-example-lib/lib/ArgParser");
const CombatErrors = require("./CombatErrors");
const { combatOptions } = require("./Combat.enums");
const Engagement = require("./Engagement");
const Perception = require("./Perception");

const luck = {
  CRITICAL: 2,
  GOOD: 1,
  NEUTRAL: 0,
  POOR: -1,
  CRITFAIL: -2,
};

const resultPosition = {
  GR_ADVANTAGED: "GR_ADVANTAGED",
  ADVANTAGED: "ADVANTAGED",
  NEUTRAL: "NEUTRAL",
  DISADVANTAGED: "DISADVANTAGED",
  GR_DISADVANTAGED: "GR_DISADVANTAGED",
};

const resultsMapping = {
  6: resultPosition.GR_ADVANTAGED,
  5: resultPosition.GR_ADVANTAGED,
  4: resultPosition.ADVANTAGED,
  3: resultPosition.NEUTRAL,
  2: resultPosition.DISADVANTAGED,
  1: resultPosition.GR_DISADVANTAGED,
  0: resultPosition.GR_DISADVANTAGED,
  GR_ADVANTAGED: 5,
  ADVANTAGED: 4,
  NEUTRAL: 3,
  DISADVANTAGED: 2,
  GR_DISADVANTAGED: 1,
};

const probabilityMap = {
  SEVENTY_FIVE: 0.75,
  FIFTY: 0.75,
  TWENTY_FIVE: 0.25,
};
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
  static updateRound(state, primary) {
    if (primary.combatData.killed) {
      // entity was removed from the game but update event was still in flight, ignore it
      return false;
    }

    if (!primary.isInCombat()) {
      if (!primary.isNpc) {
        primary.removePrompt("combat");
      }
      return false;
    }

    const engagement = Engagement.getEngagement(primary);

    // cancel if the primary's combat lag hasn't expired yet
    if (!engagement.lagIsComplete) {
      engagement.reduceLag();
      return false;
    }

    engagement.applyDefaults(state);
    Combat.resolveRound(engagement);
    Perception.perceptionCheck(engagement);
    Combat.markTime(engagement);
    engagement.completionCheck();
  }

  static resolveRound(engagement) {}

  static markTime(engagement) {
    engagement.roundStarted = Date.now();
    engagement.lag = 3000;
  }

  /**
   * Find a target for a given attacker
   * @param {Character} attacker
   */
  static prepare(attacker, target) {
    B.sayAt(attacker, "Consider your options");
    B.sayAt(target, "Consider your options");

    return true;
  }

  static defaultActionSelection(combatant) {
    if (!combatant.combatData.decision) {
      combatant.combatData.decision = combatOptions.STRIKE;
      B.sayAt(combatant, "Your instincts lead you to strike!");
    }
  }

  static clearDecisions(attacker, target) {
    attacker.combatData.decision = null;
    target.combatData.decision = null;
  }

  static compileScores(attacker, target) {
    return {
      attackerResult: {
        skill: Combat.compileSkillScore(attacker),
        luck: Combat.calculateLuck(attacker),
      },
      targetResult: {
        skill: Combat.compileSkillScore(target),
        luck: Combat.calculateLuck(target),
      },
    };
  }

  static compileSkillScore(combatant) {
    return 100;
  }

  static calculateLuck(combatant) {
    const pureLuck = Random.inRange(0, 40);
    if (pureLuck > 38) return luck.CRITICAL;
    if (pureLuck > 30) return luck.GOOD;
    if (pureLuck > 20) return luck.NEUTRAL;
    if (pureLuck > 5) return luck.POOR;
    return luck.CRITFAIL;
  }

  static processOutcome(attacker, target) {
    const { attackerResult, targetResult } = Combat.compileScores(
      attacker,
      target
    );
    const attackerPosition = Combat.calculatePosition(
      attackerResult,
      targetResult
    );
    Combat.resolvePositions(attacker, target, attackerPosition);
  }

  static calculatePosition(attackerRes, targetRes) {
    const attackerSkillRoll = Random.inRange(1, attackerRes.skill);
    const targetSkillRoll = Random.inRange(1, targetRes.skill);
    const delta = attackerSkillRoll - targetSkillRoll;
    let result;
    result = resultPosition.GR_DISADVANTAGED;
    if (delta > -66) result = resultPosition.DISADVANTAGED;
    if (delta > -33) result = resultPosition.NEUTRAL;
    if (delta > 33) result = resultPosition.ADVANTAGED;
    if (delta > 66) result = resultPosition.GR_ADVANTAGED;
    const luckMod = Combat.calculateLuckMod(attackerRes.luck, targetRes.luck);
    const modifiedResult = resultsMapping[resultsMapping[result] + luckMod];
    return modifiedResult;
  }

  static calculateLuckMod(attackerLuck, targetLuck) {
    return attackerLuck - targetLuck;
  }

  static resolvePositions(attacker, target, attackerPosition) {
    switch (attackerPosition) {
      case resultPosition.NEUTRAL:
        Combat.resolveNeutralStrike(attacker, target);
        break;
      case resultPosition.ADVANTAGED:
        Combat.resolveAdvStrike(attacker, target);
        break;
      case resultPosition.GR_ADVANTAGED:
        Combat.resolveGrAdvStrike(attacker, target);
        break;
      case resultPosition.DISADVANTAGED:
        Combat.resolveAdvStrike(target, attacker);
        break;
      case resultPosition.GR_DISADVANTAGED:
        Combat.resolveGrAdvStrike(target, attacker);
        break;
      default:
        return null;
    }
  }

  static resolveNeutralStrike(attacker, target) {
    // this has three branches
    B.sayAt(attacker, "Neutral strike");
    B.sayAt(target, "Neutral strike");
    B.sayAt(attacker, "You lash out");
    const diceRoll = Random.inRange(0, 3);
    // accidental parry
    if (diceRoll === 1) {
      B.sayAt(
        attacker,
        `*CLANG!* Your hands sting with the vibration of your weapon as you and ${target.name} deflect each others' blows.`
      );
      B.sayAt(
        target,
        `*CLANG!* Your hands sting with the vibration of your weapon as you and ${attacker.name} deflect each others' blows.`
      );
      return;
    }
    // accidental deflection, reduced damage
    if (diceRoll == 2) {
      B.sayAt(
        attacker,
        `Your attack collides with ${target.name}s, deflecting the shot just so!`
      );
      B.sayAt(
        target,
        `Your attack collides with ${attacker.name}s, deflecting the shot just so!`
      );
      Combat.makeAttack(attacker, target, probabilityMap.SEVENTY_FIVE);
      Combat.makeAttack(target, attacker, probabilityMap.SEVENTY_FIVE);
      return;
    }
    // full hits
    Combat.makeAttack(target, attacker);
    Combat.makeAttack(attacker, target);
  }

  static resolveAdvStrike(attacker, target) {
    B.sayAt(attacker, "You make an advantaged hit");
    B.sayAt(target, "You receive an advantaged hit");
    Combat.makeAttack(attacker, target);
    Combat.makeAttack(target, attacker, probabilityMap.SEVENTY_FIVE);
  }

  static resolveGrAdvStrike(attacker, target) {
    B.sayAt(attacker, "You make a greatly advantaged hit");
    B.sayAt(target, "You receive a greatly advantaged hit");
    Combat.makeAttack(attacker, target);
  }

  /**
   * Actually apply some damage from an attacker to a target
   * @param {Character} attacker
   * @param {Character} target
   */
  static makeAttack(attacker, target, mod) {
    let amount = this.calculateWeaponDamage(attacker);
    let critical = false;
    if (mod) {
      amount = Math.ceil(amount * mod);
    }
    if (attacker.hasAttribute("critical")) {
      const critChance = Math.max(attacker.getMaxAttribute("critical") || 0, 0);
      critical = Random.probability(critChance);
      if (critical) {
        amount = Math.ceil(amount * 1.5);
      }
    }

    const weapon = attacker.equipment.get("wield");
    const damage = new Damage("health", amount, attacker, weapon || attacker, {
      critical,
    });
    damage.commit(target);

    // currently lag is really simple, the character's weapon speed = lag
    // attacker.combatData.lag = this.getWeaponSpeed(attacker) * 1000;
  }

  /**
   * Any cleanup that has to be done if the character is killed
   * @param {Character} deadEntity
   * @param {?Character} killer Optionally the character that killed the dead entity
   */
  static handleDeath(state, deadEntity, killer) {
    if (deadEntity.combatData.killed) {
      return;
    }

    deadEntity.combatData.killed = true;
    deadEntity.removeFromCombat();

    Logger.log(
      `${killer ? killer.name : "Something"} killed ${deadEntity.name}.`
    );

    if (killer) {
      deadEntity.combatData.killedBy = killer;
      killer.emit("deathblow", deadEntity);
    }
    deadEntity.emit("killed", killer);

    if (deadEntity.isNpc) {
      state.MobManager.removeMob(deadEntity);
    }
  }

  static startRegeneration(state, entity) {
    if (entity.hasEffectType("regen")) {
      return;
    }

    let regenEffect = state.EffectFactory.create(
      "regen",
      { hidden: true },
      { magnitude: 15 }
    );
    if (entity.addEffect(regenEffect)) {
      regenEffect.activate();
    }
  }

  /**
   * Generate an amount of weapon damage
   * @param {Character} attacker
   * @param {boolean} average Whether to find the average or a random inRange(0, 3);between min/max
   * @return {number}
   */
  static calculateWeaponDamage(attacker, average = false) {
    let weaponDamage = this.getWeaponDamage(attacker);
    let amount = 0;
    if (average) {
      amount = (weaponDamage.min + weaponDamage.max) / 2;
    } else {
      amount = Random.inRange(weaponDamage.min, weaponDamage.max);
    }

    return this.normalizeWeaponDamage(attacker, amount);
  }

  /**
   * Get the damage of the weapon the character is wielding
   * @param {Character} attacker
   * @return {{max: number, min: number}}
   */
  static getWeaponDamage(attacker) {
    const weapon = attacker.equipment.get("wield");
    let min = 0,
      max = 0;
    if (weapon) {
      min = weapon.metadata.minDamage;
      max = weapon.metadata.maxDamage;
    }

    return {
      max,
      min,
    };
  }

  /**
   * Get the speed of the currently equipped weapon
   * @param {Character} attacker
   * @return {number}
   */
  static getWeaponSpeed(attacker) {
    let speed = 2.0;
    const weapon = attacker.equipment.get("wield");
    if (!attacker.isNpc && weapon) {
      speed = weapon.metadata.speed;
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
    amount += attacker.hasAttribute("strength")
      ? attacker.getAttribute("strength")
      : attacker.level;
    return Math.round((amount / 3.5) * speed);
  }
}

module.exports = Combat;
