'use strict';

const util = require('util');

const Type   = require('./type').Type;
const Random = require('./random').Random;
const _ = require('./helpers');

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
  if (target && (precise || Random.coinFlip())) { return target; }
  return Random.fromArray(locations);
}

/** OVERVIEW ** //////////////////////////////
* The purpose of this class is to standardize
* the realtime combat API between players & NPCs.
*/

/**
* Generic func to apply all mods to a stat,
* starting with the base stat.
*/
const applyMod  = (stat, modifier) => modifier(stat)
const applyMods = (base, modsObj)  => _
  .reduceValues(modsObj, applyMod, base);

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
  this.defenseMods = {};
  this.dodgeMods   = {};

  this.addMod = type =>
    modifier => this[type][modifier.name] = modifier.effect;

  this.addSpeedMod   = this.addMod('speedMods');
  this.addDamageMod  = this.addMod('damageMods');
  this.addToHitMod   = this.addMod('toHitMods');
  this.addDefenseMod = this.addMod('defenseMods');
  this.addDodgeMod   = this.addMod('dodgeMods');

  this.deleteMod = type =>
    name => delete this[type][name];

  this.removeSpeedMod   = this.deleteMod('speedMods');
  this.removeDamageMod  = this.deleteMod('damageMods');
  this.removeToHitMod   = this.deleteMod('toHitMods');
  this.removeDefenseMod = this.deleteMod('defenseMods');
  this.removeDodgeMod   = this.deleteMod('dodgeMods');

  this.deleteAllMods = name => {
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
    const damageRoll  = Random.inRange(...damageRange);

    const min = damageRange[0];
    const modifiedDamageRoll = applyMods(damageRoll, this.damageMods);

    const damageWithinBounds = _.setBounds(min, Infinity);
    const damageDealt = damageWithinBounds(modifiedDamageRoll);

    util.log('Deals damage: ', damageDealt);

    return damageDealt;
  };

  const getWeaponSpeed = (weapon, base, factor) => (weapon ?
    weapon.getAttribute('speed') : base) * factor;

  /**
   * Get attack speed of a player
   * @return float milliseconds between attacks
   */
  this.getAttackSpeed = Type.isNpc(this._entity) ?
    () => this._entity.getAttribute('speed') * 1000 || 1000 :
    secondAttack => {
      const weapon  = secondAttack ? this.getWeapon() : this.getOffhand();

      const minimum = secondAttack ? 750 : 500;
      const maximum = 10 * 1000;

      const speedWithinBounds = _.setBounds(minimum, maximum);

      const unarmedSpeed    = this._entity.getAttribute('quickness');
      const weaponSpeed     = getWeaponSpeed(weapon, unarmedSpeed, 500);
      const attributesSpeed = unarmedSpeed * 500
        + this._entity.getAttribute('cleverness') * 250;

      const baseSpeed = Math.min(maximum - weaponSpeed - attributesSpeed, 6000);

      util.log("Their base speed is ", baseSpeed);

      const speed = applyMods(baseSpeed, this.speedMods);

      util.log("Their modified speed is ", speed);

      return speedWithinBounds(speed);
    };

  this.soak = location => {
      location = location || 'body';
      const self = this._entity;

      const armor = location => {
        const base  = 0; //TODO: Defense skill?
        const bonus = self.checkStance('precise') ?
          self.getAttribute('willpower') + self.getAttribute('stamina') :
          base;
        const item = self.getEquipped(location, true);

        return item ?
          item.getAttribute('defense') * bonus :
          base;
      }

      let defense = armor(location);

      if (location !== 'body') {
        defense += armor('body');
      }

      defense += self.getAttribute('stamina');
      util.log(self.getName() + ' ' + location + 'base defense: ' + defense);

      defense  = applyMods(defense, self.combat.defenseMods);
      util.log(self.getName() + ' ' + location + 'modified defense: ' + defense);

      return defense;
    }

  this.getDodgeChance = () => {
    const dodgeSkill = Type.isPlayer(this._entity) ?
      this._entity.getSkills('dodging') + Random.roll() :
      this._entity.getAttribute('speed') + Random.roll();
    const dodgeBonus = Type.isPlayer(this._entity) ?
      this._entity.getAttribute('quickness')
      + Math.round(this._entity.getAttribute('cleverness') / 2) :
      this._entity.getAttribute('level') || 1;

    const dodgeChance = applyMods(dodgeSkill + dodgeBonus, this.dodgeMods);
    const dodgeWithinBounds = _.setBounds(5, 90);

    util.log('Base dodge chance is ', dodgeChance);
    return dodgeWithinBounds(dodgeChance);
  }

  this.getDesc = () => Type.isPlayer(this._entity) ?
    this._entity.getName() : this._entity.getShortDesc('en');

  this.getToHitChance = () => {
    //TODO: Weapon skills related to weapon type?
    //TODO: General combat skills?
    // Replace 1 with skill get.
    const toHitSkill = this._entity.getAttribute('level') + Random.roll(); //For now, 1-20.
    const toHitBonus = this._entity.getAttribute('cleverness')
      + Math.round(this._entity.getAttribute('quickness') / 2);
    const toHitChance = applyMods(toHitSkill + toHitBonus, this.toHitMods);
    const toHitWithinBounds = _.setBounds(5, 90);
    util.log('To hit chance is ', toHitChance);
    return toHitWithinBounds(toHitChance);
  }

  this.getDefense = () => {
    //TODO: Replace with defense func from player.
    return this._entity.getAttribute('level') * 2;
  }

  this.getTarget = () => Type.isPlayer(this._entity) ?
    this._entity.getPreference('target') :
    this._entity.getAttribute('target');

  return this;
}

function getHelper(entity) {
  return new CombatHelper(entity);
}

exports.CombatHelper = CombatHelper;
exports.CombatUtil   = {
  getHelper, decideHitLocation
};
