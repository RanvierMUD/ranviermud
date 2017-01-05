'use strict';

const util = require('util');

const Type   = require('./type').Type;
const Random = require('./random').Random;
const _ = require('./helpers');

const getSpecialEncumbranceEffects = require('./effects').getSpecialEncumbranceEffects;

//TODO: Chart this stuff out.

/* Various helper functions for combat */

/**
 * Helper func to decide where an attack lands
 * Unless the attacker is putting effort in being precise,
 * There is only a 50% chance their attack will hit its target.
 *
 * @param Array of locations to hit
 * @param String location being targeted
 * @param Boolean Is the attacker trying to be precise
 * @returns String location that get hit
 */
function decideHitLocation(locations, target, precise) {
  if (_.has(locations, target) && (precise || Random.coinFlip())) { return target; }
  return Random.fromArray(locations);
}

/**
* Generic func to apply all mods to a stat,
* starting with the base stat.
*/
const applyMod  = (stat, modifier) => modifier(stat)
const applyMods = (base, modsObj)  => _.reduceValues(modsObj, applyMod, base);

/** CombatHelper ** //////////////////////////////
* The purpose of this class is to standardize
* the realtime combat API between players & NPCs.
*/

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
  this._entity.speedMods   = this._entity.speedMods   || {};
  this._entity.damageMods  = this._entity.damageMods  || {};
  this._entity.toHitMods   = this._entity.toHitMods   || {};
  this._entity.defenseMods = this._entity.defenseMods || {};
  this._entity.dodgeMods   = this._entity.dodgeMods   || {};

  this.addMod = type =>
    modifier => this._entity[type][modifier.name] = modifier.effect;

  this.addSpeedMod   = this.addMod('speedMods');
  this.addDamageMod  = this.addMod('damageMods');
  this.addToHitMod   = this.addMod('toHitMods');
  this.addDefenseMod = this.addMod('defenseMods');
  this.addDodgeMod   = this.addMod('dodgeMods');

  this.deleteMod = type =>
    name => delete this._entity[type][name];

  this.removeSpeedMod   = this.deleteMod('speedMods');
  this.removeDamageMod  = this.deleteMod('damageMods');
  this.removeToHitMod   = this.deleteMod('toHitMods');
  this.removeDefenseMod = this.deleteMod('defenseMods');
  this.removeDodgeMod   = this.deleteMod('dodgeMods');

  this.removeAllMods = name => {
    if (!name) { return false; } //TODO: Eventually, remove all mods?
    this.removeSpeedMod(name);
    this.removeDamageMod(name);
    this.removeToHitMod(name);
    this.removeDodgeMod(name);
    this.removeDefenseMod(name);
  };


  /**
   * Get hydrated primary or offhand weapon of player/npc.
   */
   //FIXME: Can be done better with changes to npc class.
   // Works, since this will let you get damage attr.
  this.getWeapon  = location => Type.isPlayer(this._entity) ?
    this._entity.getEquipped(location || 'wield', true) :
    () => this._entity;

  this.getOffhand = () => this.getWeapon('offhand');


  /**
   * Get just the name of the attack.
   */
  this.getAttackName = location => {
    const defaultWeapon = 'bare hands';
    if (Type.isPlayer(this._entity)) {
      const weapon = this.getWeapon(location);
      return weapon ?
        weapon.getShortDesc('en') :
        defaultWeapon;
    }
    return this._entity.getAttack('en') || defaultWeapon;
  }


  this.getPrimaryAttackName   = () => this.getAttackName('wield');
  this.getSecondaryAttackName = () => this.getAttackName('offhand');

  /**
  * Gets damage range from weapon obj
  * @param   Weapon obj
  * @param   Base possible damage for hand-to-hand
  * @return  Array of [min, max] damage range
  */
  const getWeaponDamage = (weapon, base) => weapon ?
    (weapon.getAttribute('damage') ?
      weapon.getAttribute('damage')
        .split('-')
        .map(dmg => parseInt(dmg, 10)) :
        base) :
      base;

  /**
   * Get the damage a player can do
   * @return int
   */
  this.getDamage = location => {
    location = location || 'wield';

    const self   = this._entity;
    const weapon = Type.isPlayer(self) ?
      this.getWeapon(location) :
      self;
    const base   = Type.isPlayer(self) ?
      [ 1, self.getAttribute('stamina') + 5 ] :
      [ 1, 20 ];

    const damageRange = getWeaponDamage(weapon, base);
    const damageRoll  = Random.inRange(...damageRange) + this._entity.getAttribute('level');

    const min = damageRange[0];
    const modifiedDamageRoll = applyMods(damageRoll, this._entity.damageMods);

    const damageWithinBounds = _.setBounds(min, Infinity);
    const damageDealt = damageWithinBounds(modifiedDamageRoll);

    util.log('Deals damage: ', damageDealt);

    return damageDealt;
  };

  const getWeaponSpeed = (weapon, base, factor) =>
    factor * (weapon ?
      weapon.getAttribute('speed') || 1 :
      base);

  /**
   * Get attack speed of a player
   * @return float milliseconds between attacks
   */
  this.getAttackSpeed = Type.isNpc(this._entity) ?
    () => (this._entity.getAttribute('speed') * 1000 || 5000) :
    secondAttack => {
      const weapon = secondAttack ? this.getOffhand() : this.getWeapon();
      const speedFactor = 250; // ms

      const unarmedSpeed    = this._entity.getAttribute('quickness');
      const weaponSpeed     = getWeaponSpeed(weapon, unarmedSpeed, speedFactor);
      const attributesSpeed = unarmedSpeed * speedFactor
        + this._entity.getAttribute('cleverness') * (speedFactor / 2);

      const minimum = speedFactor * (secondAttack ? 20 : 12);
      const maximum = speedFactor * Math.max((50 - unarmedSpeed), 32);
      const speedWithinBounds = _.setBounds(minimum, maximum);

      const mean = maximum / 2;
      const baseSpeed = Math.max(mean - weaponSpeed, 0);

      util.log("Their base speed is ", baseSpeed);

      const speed = applyMods(baseSpeed, this._entity.speedMods) + Random.inRange(-1000, 1000);

      util.log("Their modified speed is ", speed);

      return speedWithinBounds(speed);
    };

  this.soak = location => {
      location = location || 'body';
      const self = this._entity;

      const armor = location => {
        const base  = 0; //TODO: Defense skill?
        const item = self.getEquipped(location, true);

        return item ?  item.getAttribute('defense') : base;
      }

      let defense = armor(location);

      if (location !== 'body') {
        defense += armor('body');
      }

      defense += self.getAttribute('stamina');
      util.log(self.getName() + ' ' + location + ' base defense: ' + defense);

      defense  = applyMods(defense, self.combat.defenseMods);
      util.log(self.getName() + ' ' + location + ' modified defense: ' + defense);

      return defense;
    }

  this.getDodgeChance = () => {
    const level = this._entity.getAttribute('level');
    const isPlayer = Type.isPlayer(this._entity);
    const bonus = Random.inRange(1, Math.max(level, 6)) * .8;

    const dodgeSkill = isPlayer ?
      this._entity.getSkills('dodging')  + bonus :
      this._entity.getAttribute('dodge') || 1;
    const parrySkill = isPlayer ?
      this._entity.getSkills('parrying') :
      level || 1;

    const totalDodgeBonus   = dodgeSkill + parrySkill + bonus;
    const dodgeChance       = applyMods(totalDodgeBonus, this._entity.dodgeMods);
    const dodgeWithinBounds = _.setBounds(5, 90);

    util.log('Base dodge chance is ', dodgeChance);
    return dodgeWithinBounds(dodgeChance);
  }

  this.getToHitChance = () => {
    const level = this._entity.getAttribute('level');
    const bonus = Random.inRange(1, Math.max(level, 6));

    //TODO: Weapon skills related to weapon type?
    //TODO: General combat skills?
    const toHitSkill = level + bonus; //For now, 1-20.
    const toHitBonus = this._entity.getAttribute('cleverness') + bonus
      + Math.round(this._entity.getAttribute('quickness') / 2  + bonus);
    const toHitChance = applyMods(toHitSkill + toHitBonus, this._entity.toHitMods);
    const toHitWithinBounds = _.setBounds(5, 90);
    util.log(this._entity.getShortDesc('en') + ': To hit chance is ', toHitChance);
    return toHitWithinBounds(toHitChance);
  }

  this.getDefense = location => Type.isPlayer(this._entity) ?
    this.soak(location) :
    this._entity.getDefenses(location) ||
    this._entity.getDefenses('body')   || 1;

  this.getTarget = () => Type.isPlayer(this._entity) ?
    this._entity.getPreference('target') :
    this._entity.getAttribute('target');

  return this;
}

function setEncumbrancePenalties(entity, encumbrance) {
  entity.combat.removeAllMods('encumbrance');
  const { multiplier, description } = encumbrance;

  entity.combat.addSpeedMod({
    name:  'encumbrance',
    effect: speed => speed * multiplier
  });

  entity.combat.addDodgeMod({
    name:  'encumbrance',
    effect: dodge => dodge / multiplier
  });

  const specialEffects = getSpecialEncumbranceEffects(entity)[description];

  for (const attrToMod in specialEffects) {
    const modifier = specialEffects[attrToMod];
    entity.combat.addMod(attrToMod)(modifier);
  }

  return specialEffects;
}

function getHelper(entity) {
  return new CombatHelper(entity);
}



exports.CombatHelper = CombatHelper;
exports.CombatUtil   = {
  getHelper, decideHitLocation,
  setEncumbrancePenalties
};
