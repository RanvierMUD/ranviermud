'use strict';

/**
 * Error used when trying to execute a skill and the player doesn't have enough resources
 * @extends Error
 */
class NotEnoughResourcesError extends Error {}
exports.NotEnoughResourcesError = NotEnoughResourcesError;

/**
 * Error used when trying to execute a passive skill
 * @extends Error
 */
class PassiveError extends Error {}
exports.PassiveError = PassiveError;

/**
 * Error used when trying to execute a skill on cooldown
 * @property {Effect} effect
 * @extends Error
 */
class CooldownError extends Error {
  /**
   * @param {Effect} effect Cooldown effect that triggered this error
   */
  constructor(effect) {
    super();

    this.effect = effect;
  }
}
exports.CooldownError = CooldownError;
