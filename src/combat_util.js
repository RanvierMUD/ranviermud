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
   * Example: { 'berserk': damage => damage * 2 }
   */
  this.speedMods   = {};
  this.damageMods  = {};
  this.toHitMods   = {};

  this.addSpeedMod  = addMod('speedMods');
  this.addDamageMod = addMod('damageMods');
  this.addToHitMod  = addMod('toHitMods');

  function addMod(type) {
    return modifier => this[type][modifier.name] = modifier.effect;
  }

  this.removeSpeedMod  = deleteMod('speedMods');
  this.removeDamageMod = deleteMod('damageMods');
  this.removeToHitMod  = deleteMod('toHitMods');

  function deleteMod(type) {
    return name => delete this[type][name];
  }

  return this;
}

function getHelper(entity) {
  return new CombatHelper(entity);
}

exports.CombatUtil   = { getHelper };
exports.CombatHelper = CombatHelper;
