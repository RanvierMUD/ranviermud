const util = require('util');

const Type = require('./type').Type;
const _ = require('./helpers');

/*
 * These functions take an entity (npc/player)
 * and return the correct method or property
 * depending on type.
 */

const getName = entity => Type.isPlayer(entity) ?
  entity.getName() :
  entity.getShortDesc('en');

const getSpeed = entity => entity.getAttackSpeed;

const getWeapon = entity => Type.isPlayer(entity) ?
  entity.getEquipped('wield', true) :
  entity.getAttack('en');

const getOffhand = entity => Type.isPlayer(entity) ?
  entity.getEquipped('offhand', true) :
  null; //TODO: allow for dual attacks for npcs

const getBodyParts = entity => Type.isPlayer(entity) ?
  playerBodyParts :
  entity.getBodyParts();


function CombatHelper(entity) {
  this._entity = entity;

  /*
   * Example modifier: {
      name: 'berserk',
      effect: damage => damage * 2
    }
   * Speed mods will affect time in between attacks
   * in milliseconds. So, doubling it will half attack speed.
   */
  this.speedMods   = {};
  this.damageMods  = {};
  this.toHitMods   = {};

  const addMod = type =>
    modifier => this[type][modifier.name] = modifier.effect;

  this.addSpeedMod  = addMod('speedMods');
  this.addDamageMod = addMod('damageMods');
  this.addToHitMod  = addMod('toHitMods');

  const deleteMod = type =>
    name => delete this[type][name];

  this.removeSpeedMod  = deleteMod('speedMods');
  this.removeDamageMod = deleteMod('damageMods');
  this.removeToHitMod  = deleteMod('toHitMods');

  /**
   * Get primary weapon of player
   *
   */
  this.getWeapon = () => this._entity.getEquipped('wield', true);
  /**
   * Get attack speed of a player
   * @return float milliseconds between attacks
   */
  this.getAttackSpeed = secondAttack => {
    const weapon  = secondAttack ? this.getSecondary() : this.getWeapon();
    const minimum = secondAttack ? 750 : 500;
    const maximum = 10 * 1000;

    const unarmedSpeed = this._entity.getAttribute('quickness');
    const weaponSpeed  = (weapon ?
      weapon.getAttribute('speed') :
      unarmedSpeed) * 500;
    const attributesSpeed = unarmedSpeed * 500
      + this._entity.getAttribute('cleverness') * 250;

    const baseSpeed = maximum - weaponSpeed - attributesSpeed;

    util.log("Player's base speed is ", baseSpeed);

    const speed = _
      .values(this.speedMods)
      .reduce((speed, modifier) => modifier(speed), baseSpeed);

    util.log("Player's modified speed is ", speed);

    //TODO: Use mod methods instead.
    // const stanceToSpeed = {
    //   'precise': 1.25,
    //   'cautious': 2,
    //   'berserk': .5,
    // };
    //
    // for (const stance in stanceToSpeed){
    //   if (self.checkStance(stance)) {
    //     const speedModifier = stanceToSpeed[stance];
    //     util.log(self.getName() + '\'s speed is modified: x' + speedModifier);
    //     speed = speed * speedModifier;
    //   }
    // }

    return Math.max(Math.min(maximum, speed), minimum);
  };

  return this;
}

function getHelper(entity) {
  return new CombatHelper(entity);
}

exports.CombatUtil   = { getHelper };
exports.CombatHelper = CombatHelper;
