'use strict';

/**
 * Error used when a target tries to attack themselves
 * @extends Error
 */
class CombatSelfError extends Error {}
exports.CombatSelfError = CombatSelfError;

/**
 * Error used when a combat target is invalid for some reason (doesn't have a health attribute/whatever)
 */
class CombatInvalidTargetError extends Error {}
exports.CombatInvalidTargetError = CombatInvalidTargetError;

/**
 * Error used when trying to attack a pacifist flagged NPC
 * @property {Npc} target
 * @extends Error
 */
class CombatPacifistError extends Error {
  constructor(message, target) {
    super(message);

    this.target = target;
  }
}
exports.CombatPacifistError = CombatPacifistError;

/**
 * Error used when trying to attack a non-pvp flagged player
 * @property {Player} target
 * @extends Error
 */
class CombatNonPvpError extends Error {
  constructor(message, target) {
    super(message);

    this.target = target;
  }
}
exports.CombatNonPvpError = CombatNonPvpError;
