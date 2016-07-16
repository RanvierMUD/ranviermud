const Type = require('./type').Type;


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
  this.entity      = entity;

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

  return this;
}

function getHelper(entity) {
  return new CombatHelper(entity);
}

exports.CombatUtil   = { getHelper };
exports.CombatHelper = CombatHelper;
