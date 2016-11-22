const util    = require('util');
const Effects = require('./effects').Effects;

const penalize = (player, item, attr, callback) => {
  util.log('factor for ' + attr + ' is:');
  const factor = player.getAttribute(attr) / item.getPrerequisite(attr);
  util.log(factor);
  callback(factor);
}

const getPenaltyDesc = (item, location, status) => status + '_by_' + item.getShortDesc() + '_' + location;

const useDefaultPenalties = (item, player, location, missedPrerequisites, verb) => {
  const gerund = verb ? verb + 'ing' : 'using';
  verb = verb || 'use';

  missedPrerequisites.forEach(prereq => {
    switch (prereq) {

      case 'stamina':
        return penalize(player, item, 'stamina', factor => {
          const name = getPenaltyDesc(item, location, 'encumbered');
          player.warn('You are not strong enough to ' + verb + ' this properly.');

          player.addEffect(name , Effects.encumbered({ player, factor }));
          player.combat.addSpeedMod({ name, effect: speed => speed / factor });
        });

      case 'quickness':
        return penalize(player, item, 'quickness', factor => {
          const name = getPenaltyDesc(item, location, 'slowed');

          player.warn('You are not quick enough to move about deftly while ' + gerund + ' the ' + item.getShortDesc() + '.');
          player.combat.addDodgeMod({ name, effect: dodge => dodge * factor });
        });

      case 'cleverness':
        return penalize(player, item, 'cleverness', factor => {
          const name = getPenaltyDesc(item, location, 'confused');

          player.warn('You are not sure how to handle this piece of gear...');
          player.combat.addToHitMod({ name, effect: toHit => toHit * factor });
        });

      case 'willpower':
        return penalize(player, item, 'willpower', factor => {
          const name = getPenaltyDesc(item, location, 'distracted');

          player.warn('You find yourself easily distracted as you ' + verb + ' the ' + item.getShortDesc());
          player.combat.addDefenseMod({ name, effect: defense => defense * factor });
        });

      default:
        player.warn('You have some trouble ' + gerund + ' it...');
        util.log('ITEM ' + item.getShortDesc() + ' has unsupported prerequisites.');
    }
  });

};

const removeDefaultPenaltes = (player, item, location) => {
  const itemDesc = item.getShortDesc();

  const encumbered = getPenaltyDesc(item, location, 'encumbered');
  const confused   = getPenaltyDesc(item, location, 'confused');
  const distracted = getPenaltyDesc(item, location, 'distracted');
  const slowed     = getPenaltyDesc(item, location, 'slowed');

  player.removeEffect(encumbered);
  player.removeEffect(confused);

  player.combat.deleteAllMods(distracted);
  player.combat.deleteAllMods(encumbered);
  player.combat.deleteAllMods(slowed);
};

const checkForCrit = (attacker, defender, damageDealt) => {
  const defenderHealth = defender.getAttribute('health');
  const defenderMaxHealth = defender.getAttribute('max_health');


  //TODO: Improve... if the damage is over the weapon's normal max damage it should be considered a crit...
  const massiveDamage = damageDealt > defenderMaxHealth * .5;
  const almostDead    = defenderHealth <= defenderMaxHealth * .2;
  const coupDeGrace   = almostDead && damageDealt >= defenderHealth;

  if (massiveDamage || coupDeGrace) {
    //TODO: Add some kind of bonus.
    attacker.say('<bold><cyan>You have dealt a critical blow!</cyan></bold>');
  }
}

const inventoryFlattener = (inv, item) => {
  try {
    return inv.concat(item).concat(item.getFlattenedInventory());
  } catch (e) {
    util.log('AW DANG:', e);
    util.log('ITEM: ', item);
    return inv.concat(item);
  }
}

function checkInventory(player, item) {
  const inventory = player.getInventory();
  return [ tooLarge(inventory, player, item) , tooHeavy(inventory, player, item) ];
}

function tooLarge(inventory, player, item) {
  const itemSize = item.getAttribute('size');
  if (itemSize === Infinity) { return true; }

  const containerWithCapacity = player.getContainerWithCapacity(itemSize);
  return !containerWithCapacity;
}

function tooHeavy(inventory, player, item) {
  const itemWeight = item.getWeight();
  if (itemWeight === Infinity) { return true; }

  const carriedWeight  = player.getCarriedWeight();
  const maxCarryWeight = player.getMaxCarryWeight();

  return (carriedWeight + itemWeight) > maxCarryWeight;
}

function hold({ player, room, item }, callback) {
  const equipment = player.getEquipped();
  const location  = player.findHoldingLocation(); 
  
  player.equip(location, item);

  player.addItem(item);
  if (room) { room.removeItem(item.getUuid()) };
  item.setRoom(null);
  item.setHolder(player.getName());
  item.setEquipped(true);

  callback(location);
}

function pickUp({ player, room, item }, callback) {
  item.setRoom(null);
  item.setHolder(player.getName());
  
  const container = player.getContainerWithCapacity(item.getAttribute('size'));
  container.addItem(item);
  item.setContainer(container);
  if (room) { room.removeItem(item.getUuid()); }

  callback(container);
}

function getFailureMessage(tooLarge, tooHeavy, item) {
  const itemName = item.getShortDesc();
  
  if (tooLarge) { return `The ${itemName} will not fit in your inventory, it is too large.`; }
  if (tooHeavy) { return `The ${itemName} is too heavy for you to carry at the moment.`; }
  return `You cannot pick up ${itemName} right now.`;
}

exports.ItemUtil = {
  checkInventory, 
  hold, pickUp,
  getFailureMessage, 
  tooLarge, tooHeavy,
  inventoryFlattener,
  penalize, getPenaltyDesc,
  useDefaultPenalties, checkForCrit,
  removeDefaultPenaltes
};
