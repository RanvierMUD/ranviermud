const util = require('util');
const CommandUtil = require('./command_util').CommandUtil;
const Effects     = require('./effects').Effects;

/* HANDLING PREREQUISITES FOR EQUIPMENT */

/* Helper for penalizing players based on missing prerequisites.
 * @param Player object
 * @param Item object
 * @param Attribute string (such as 'willpower')
 * @param Callback fn to be used
 * @return void (factor is passed into callback)
*/
const penalize = (player, item, attr, callback) => {
  const factor = player.getAttribute(attr) / item.getPrerequisite(attr);
  callback(factor);
}


/* Helper for getting the description of a default prerequisites penalty.
 * Really, just used as an ID for the effects.
 * @param Item object
 * @param Location wearLocation string
 * @param status string (such as "encumbered")
 * @return effect Id string
*/
const getPenaltyDesc = (item, location, status) => status + '_by_' + item.getShortDesc() + '_' + location;


/* Function to set up default penalties if the user of an item does not meet all prereqs.
 * @param Item object
 * @param Player object
 * @param Location wearLocation string
 * @param missedPrerequisites []strings of attributes the player does not meet prerequisites for
 * @param verb String (such as "wear" or "wield")
 * @return void
*/
const useDefaultPenalties = (item, player, location, missedPrerequisites, verb) => {
  const gerund = verb ? verb + 'ing' : 'using';
  verb = verb || 'use';

  missedPrerequisites.forEach(prereq => {
    switch (prereq) {


      case 'stamina':
        return penalize(player, item, 'stamina', factor => {
          const name = getPenaltyDesc(item, location, 'encumbered');
          player.warn('You are not strong enough to ' + verb + ' this properly.');

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


/* Used when removing an item to wipe away all default penalties.
 * @param player object
 * @param item object
 * @param location wearLocation string
 * @return void
*/
const removeDefaultPenaltes = (player, item, location) => {
  const itemDesc = item.getShortDesc();

  const encumbered = getPenaltyDesc(item, location, 'encumbered');
  const confused   = getPenaltyDesc(item, location, 'confused');
  const distracted = getPenaltyDesc(item, location, 'distracted');
  const slowed     = getPenaltyDesc(item, location, 'slowed');

  player.removeEffect(encumbered);
  player.removeEffect(confused);

  player.combat.removeAllMods(distracted);
  player.combat.removeAllMods(encumbered);
  player.combat.removeAllMods(slowed);
};


/* HANDLING SPECIAL ITEM-BASED EVENTS  */


/* Used to decide if a hit with a weapon is a critical hit or not.
  //TODO: Use EventEmitters to emit a critical hit event for the item, so each item can have special crit effects.
 * @param Attacker object (NPC or Player)
 * @param Defender object (NPC or Player)
 * @param damageDealt int
 * @return void
*/
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


/* HANDLING INVENTORY MANAGEMENT */


/* Used in "get" to see if the player's inventory can fit the item or not.
 * @param Player object
 * @param Item object
 * @param Items manager object
 * @return Boolean True if the item will fit, else false
*/
function checkInventory(player, item, items) {
  return [ tooLarge(player, item, items) , tooHeavy(player, item, items) ];
}


/* Used to determine if the player has any containers with enough volume to fit the item.
 * @param Player object
 * @param Item object
 * @param Items manager object
 * @return Boolean True if the item will fit, else false
*/
function tooLarge(player, item, items) {
  const itemSize = item.getAttribute('size');
  if (itemSize === Infinity) { return true; }

  const containerWithCapacity = player.getContainerWithCapacity(items, itemSize);
  return !containerWithCapacity;
}


/* Used to determine if the player has any containers strong enough to carry its weight.
 * @param Player object
 * @param Item object
 * @param Items manager object
 * @return Boolean True if the item will fit, else false
*/
function tooHeavy(player, item, items) {
  const itemWeight = item.getWeight(items);
  if (itemWeight === Infinity) { return true; }

  const carriedWeight  = player.getCarriedWeight(items);
  const maxCarryWeight = player.getMaxCarryWeight();

  return (carriedWeight + itemWeight) > maxCarryWeight;
}


/* Helper function for a player who is going to be holding an item that they get.
 * @param config {player, room, item} -- room is optional.
 * @param callback fn to be called with the held location for cleanup purposes.
 * @return void
*/
function hold({ player, room, item }, callback) {
  const equipment = player.getEquipped();
  const location  = player.findHoldingLocation();

  player.addItem(item);
  if (room) { room.removeItem(item) };
  item.setRoom(null);
  item.setHolder(player.getName());
  player.equip(location, item);
  item.setEquipped(true);

  callback(location);
}


/* Helper function for a player who is going to be picking up an item and placing it in container.
 * @param config {player, room, item} -- room is optional.
 * @param callback fn to be called with the container obj for cleanup purposes.
 * @return void
*/
function pickUp({ player, room, item, items }, callback) {

  const container = player
    .getContainersWithCapacity(items, item.getAttribute('size'))
    .filter(it => it !== item)
    .filter(it => it.getAttribute('maxWeightCapacity') - it.getContainerWeight(items) >= item.getAttribute('weight'))[0];

  item.setRoom(null);
  item.setHolder(player.getName());
  player.addItem(item);
  container.addItem(item);
  if (room) { room.removeItem(item); }

  callback(container);
}


/* Used for deleting an item from equipment, including moving from one slot to another.
 * @param entity player or anything with equipment
 * @param item object
 * @param location new location to equip item at.
 * @return string new location where item is equipped.
 */
function deleteFromEquipment(entity, item, location) {
  for (const slot in entity.equipment) {
    if (slot === location) { continue; }
    if (entity.equipment[slot] === item.getUuid()) {
      delete entity.equipment[slot];
      return slot;
    }
  }
}


/* Returns a string explaining why they can not pick up the item.
 * @param tooLarge Boolean
 * @param tooHeavy Boolean
 * @param item object
 * @return failureMessage String
*/
function getFailureMessage(tooLarge, tooHeavy, item) {
  const itemName = item.getShortDesc();

  if (tooLarge) { return `The ${itemName} will not fit in your inventory, it is too large.`; }
  if (tooHeavy) { return `The ${itemName} is too heavy for you to carry at the moment.`; }
  return `You cannot pick up ${itemName} right now.`;
}


/* Is the player holding the item?
 * @param player object
 * @param item object
 * @return isHel Boolean
*/
function isHeld(player, item) {
  const equipment = player.getEquipped();
  return ['held', 'wield', 'offhand', 'offhand held'].filter(slot => equipment[slot] === item.getUuid())[0];
}


// FIXME: Deprecate the items below, or at least have them call above functions and then
// return a boolean.


/* It puts the item in the container
 * //TODO: Consider deprecating this since it does mostly the same stuff as the above function 'pickUp'.
 * @param item, container, player, players
 * @return true if it succeeded
*/
function putItemInContainer(item, container, player, players) {
    const containerName = container.getShortDesc();
    const itemName      = item.getShortDesc();
    container.addItem(item);

    // Remove if equipped.
    if (item.isEquipped()) {
      item.setEquipped(false);
      deleteFromEquipment(player, item);
    }

    // Broadcast it.
    player.say(`You remove the ${itemName} and place it in your ${containerName}.`);
    players.eachIf(
      p => CommandUtil.inSameRoom(p, player),
      p => p.say(`${player.getName()} places their ${itemName} in their ${containerName}.`)
    );
    return true;
  }


  /* It puts the item in the hands
  * //TODO: Consider deprecating this since it does mostly the same stuff as the above function 'hold'.
  * @param item, container, player, players
  * @return true if it succeeded
  */
  function holdOntoItem(item, holdingLocation, player, players) {
    const itemName = item.getShortDesc();
    player.equip(holdingLocation, item);
    return true;
  }

exports.ItemUtil = {
  isHeld, deleteFromEquipment,
  checkInventory, putItemInContainer,
  hold, pickUp,
  getFailureMessage, holdOntoItem,
  tooLarge, tooHeavy,
  penalize, getPenaltyDesc,
  useDefaultPenalties, checkForCrit,
  removeDefaultPenaltes
};
