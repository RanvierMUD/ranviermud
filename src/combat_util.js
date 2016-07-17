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
   * Returns its name
   */

  this.getAttack = location => this._entity
    .getEquipped(location || 'wield', true)
    .getShortDesc('en');

  this.getSecondary = () => this.getAttack('offhand');


  /**
  * Generic func to apply all mods to a stat,
  * starting with the base stat.
  */
  const applyMods = (base, modsObj) => _
    .values(modsObj)
    .reduce((stat, modifier) => modifier(stat), base);

  /**
  * Returns the max or min if the stat is out of bounds.
  */
  const setBounds = (min, max) => stat =>
    Math.max(Math.min(max, stat), min);

  const getWeaponDamage = (weapon, base) => weapon ?
    (weapon.getAttribute('damage') ?
      weapon.getAttribute('damage')
        .split('-')
        .map(dmg => {
          return parseInt(dmg, 10);
        }) : base
   ) : base;

  /**
   * Get the damage a player can do
   * @return int
   */

  this.getDamage = location => {
    location = location || 'wield';
    const weapon = self.getEquipped(location, true);
    const base   = [1, self.getAttribute('stamina') + 5];

    const damageRange = getWeaponDamage(weapon, base);

    return { min: damage[0], max: damage[1] };
  };


  //TODO: Use mods instead.
  // function addDamageBonus(d) {
  //   let stance = self.getPreference('stance');
  //   let bonuses = {
  //     'berserk': self.getAttribute('stamina') * self.getAttribute('quickness'),
  //     'cautious': -(Math.round(d / 2)),
  //     'precise': 1
  //   };
  //   return bonuses[stance] || 0;
  // }

  /**
   * Get attack speed of a player
   * @return float milliseconds between attacks
   */
  this.getAttackSpeed = secondAttack => {
    const weapon  = secondAttack ? this.getSecondary() : this.getWeapon();

    const minimum = secondAttack ? 750 : 500;
    const maximum = 10 * 1000;

    const speedWithinBounds = setBounds(minimum, maximum);

    const unarmedSpeed = this._entity.getAttribute('quickness');
    const weaponSpeed  = (weapon ?
      weapon.getAttribute('speed') :
      unarmedSpeed) * 500;
    const attributesSpeed = unarmedSpeed * 500
      + this._entity.getAttribute('cleverness') * 250;

    const baseSpeed = maximum - weaponSpeed - attributesSpeed;

    util.log("Player's base speed is ", baseSpeed);

    const speed = applyMods(baseSpeed, this.speedMods);

    util.log("Player's modified speed is ", speed);

    //TODO: Use mod methods instead.
    // const stanceToSpeed = {
    //   'precise': 1.25,
    //   'cautious': 2,
    //   'berserk': .5,
    // };

    return speedWithinBounds(speed);
  };

  return this;
}

function getHelper(entity) {
  return new CombatHelper(entity);
}

exports.CombatUtil   = { getHelper };
exports.CombatHelper = CombatHelper;
