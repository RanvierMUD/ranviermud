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

function get(entity) {
  const name      = getName(entity);
  const getSpeed  = getSpeed(entity);
  const weapon    = getWeapon(entity);
  const offhand   = getOffhand(entity);
  const locations = getBodyParts(entity);

  return {
    name,
    getSpeed,
    weapon,
    offhand,
    locations
  };
}

exports.CombatUtil = { get };
