'use strict';

module.exports.initCombat = _initCombat;

//TODO: Add strings for sanity damage
//TODO: Enhance for co-op, allow for setInCombat of NPC with multiple players.
//FIXME: For the love of all that is unholy, refactor this:

const util = require('util');
const _    = require('./helpers');

const Random      = require('./random.js').Random;
const LevelUtil   = require('./levels').LevelUtil;
const CommandUtil = require('./command_util').CommandUtil;
const statusUtils = require('./status');
const Commands    = require('./commands').Commands;
const CombatUtil  = require('./combat_util').CombatUtil;
const Type        = require('./type').Type;

function _initCombat(l10n, target, player, room, npcs, players, rooms, callback) {
  const locale = Type.isPlayer(player) ? player.getLocale() : 'en';
  player.setInCombat(target);
  target.setInCombat(player);

  player.sayL10n(l10n, 'ATTACK', target.combat.getDesc());


  /*
    Ideas:

    To hit vs. Dodge:
      Dodge = chance of auto-dodge, or does it need to be manual?
              Leave open to potential manual dodging in future.
              (manual dodging = temp. increase to dodge and lowered toHit/attackSpeed)
      ToHit = chance of hitting the enemy
              chance of hitting = attacker.toHit vs. target.dodge

    Damage vs. Defense:
      Defense soaks up damage depending on where the hit lands.
      It is possible for a blow to hit but then do zero damage.
      Defenses should be able to stack.

    Have different messaging for a dodged blow vs. a blow that hits
    yet does no damage.

    Also have different messaging for a near miss and a complete miss,
    as well as varieties of damage done.

    Consider having primary and secondary attacks for each npc, with varying
    amounts of damage.

    Consider allowing npcs to be equipped with armor and such at some point
    (this will be easier to implement with new API)
  */



  /**
   * Create attack round functions, then attach them
   * to the combat helper objects for each entity.
   *
   * Then, invoke a timeout for each combatant's round.
   * //TODO: Cancel the timeouts when combat ends due to fleeing/death/etc.
   */
  const playerCombatContext = { combatRound: null };
  const targetCombatContext = { combatRound: null };
  const playerCombat = combatRound.bind(playerCombatContext, player, target);
  const targetCombat = combatRound.bind(targetCombatContext, target, player);

  playerCombatContext.combatRound = playerCombat;
  targetCombatContext.combatRound = targetCombat;

  const targetCombatCancel = setTimeout(targetCombat, target.combat.getAttackSpeed());
  const playerCombatCancel = setTimeout(playerCombat, player.combat.getAttackSpeed());

  /**
   * Detect if the attacker is dual wielding.
   * Then, figure out the speed and damage -- since
   * both are decreased depending on the player's skill level in
   * dual-wielding.
   *
   * Then, create another combat round so the attacker can dual-attack.
   * //TODO: Do the same for the defender once NPC dual attacks are a thing.
   * //TODO: Do the same once PvP is a thing, too.
   */

  const dualWieldBaseSpeed   = 2.1;
  const dualWieldSpeedFactor = dualWieldBaseSpeed - (player.getSkills('dual') / 10);

  //TODO: What if they swap weapons mid-fight?
  let isDualWielding = CommandUtil.hasScript(player.combat.getOffhand(), 'wield');
  const getDuelWieldSpeed = ()   => player.combat.getAttackSpeed(isDualWielding) * dualWieldSpeedFactor;
  const dualWieldDamage = damage => Math.round(damage * (0.5 + player.getSkills('dual') / 10));
  let dualWieldCancel = null;

  if (isDualWielding) {
    util.log("Player is using dual wield!");
    const secondAttack = {
      isSecondAttack: true,
    }
    const dualWieldCombat = combatRound.bind(secondAttack, player, npc);
    secondAttack.combatRound = dualWieldCombat;
    dualWieldCancel = setTimeout(dualWieldCombat, getDuelWieldSpeed());
  }

  /**
   * Main combat round
   * Flow:
   * ======
   * Check if already in combat.
   * Determine speeds and effects. (tired, stressed, insane)
   * Set constants for this round. (speeds, descs, starting health, etc.)
   * Determine potential damage/sanity damage.
   * Determine hit location.
   *
   *
   *
   *
   * @param attacker
   * @param defender
   */

  function combatRound(attacker, defender) {

    // Handle if attacker or defender is already in combat...
    //TODO: Remove this when allowing for multicombat.
    //TODO: Use an array of targets for multicombat.
    if (!defender.isInCombat() || !attacker.isInCombat()) { return; }

    // Handle attacker fatigue...
    const energyCost   = 2;
    const slowAttacker = Type.isPlayer(attacker) && !attacker.hasEnergy(energyCost);
    if (slowAttacker) {
      attacker.addEffect('fatigued', Effects.fatigued);
    }

    // Handle attacker sanity effects...
    const stressedLimit = 40;
    const stressedAttacker = Type.isPlayer(attacker) && attacker.getAttribute('sanity') <= stressedLimit;
    if (stressedAttacker) {
      attacker.addEffect('stressed', Effects.stressed);

      const insanityLimit = 20;
      if (attacker.getAttribute('sanity') > insanityLimit) {
        attacker.addEffect('insane', Effects.insane);
      }
    }

    // Assign constants for this round...
    const attackerSpeed = attacker.combat.getAttackSpeed(this.isSecondAttack);
    const attackerDesc  = attacker.combat.getDesc();
    const defenderDesc  = defender.combat.getDesc();
    const attackDesc    = this.isSecondAttack ?
      attacker.combat.getSecondaryAttackName() :
      attacker.combat.getPrimaryAttackName();

    const attackerWeapon = this.isSecondAttack ?
      attacker.combat.getOffhand() :
      attacker.combat.getWeapon();

    const defenderStartingHealth = defender.getAttribute('health');

    // Log constants for this round...
    util.log(attackerDesc + ' has speed of ' + attackerSpeed + '.');
    util.log(attackerDesc + ' health: ' + attacker.getAttribute('health'));
    util.log(defenderDesc + ' health: ' + defenderStartingHealth + '.\n');
    util.log(attackerDesc + ' is attacking... ');
    this.isSecondAttack ?
      util.log('** Offhand attack: ') :
      util.log('** Primary attack: ')

    // Assign possible sanity damage (for now, only npcs do sanity dmg)...
    const defenderSanity = defender.getAttribute('sanity');
    const sanityDamage = Type.isPlayer(defender) ?
      attacker.getSanityDamage() : 0; //TODO: Extract into module.

    // Decide where the hit lands
    const hitLocation = CombatUtil.decideHitLocation(defender.getBodyParts(), attacker.combat.getTarget(), isPrecise());

    function isPrecise() {
      return Type.isPlayer(attacker) ?
        attacker.checkStance('precise') : false;
    }

    const missed = attacker.combat.getToHitChance() <= defender.combat.getDodgeChance();

    // If their attack misses!
    if (missed) {

      // Do they dodge, parry, or is it just a straight up miss?
      //TODO: Improve the parry, dodge, and miss scripts.
      const defenderWeapon = defender.combat.getWeapon();
      const canParry = defenderWeapon ?
        CommandUtil.hasScript(defenderWeapon, 'parry') :
        CommandUtil.hasScript(defender, 'parry');
      const canDodge = CommandUtil.hasScript(defender, 'dodge');

      let missMessage = ' misses.';

      //TODO: Consider adding a parry skill/modifier.
      //TODO: Consider making this less random.
      if (canParry && Random.coinFlip()) {
        util.log('The attack is parried!');
        missMessage = ' it is parried.';
        defenderWeapon.emit('parry', defender, attacker);
      } else if (canDodge && Random.coinFlip()) {
        util.log('They dodge!');
        missMessage = ' it is dodged.';
        defender.emit('dodge', defender, attacker)
      } else {

        // If it is just a regular ole miss...
        //TODO: What if there are no players involved in combat?
        //TODO: Create a utility func for broadcasting to first, second, and 3rd parties.
        // Make it hella configurable.
        if (Type.isPlayer(attacker)) {
          player.sayL10n(l10n, 'PLAYER_MISS', defenderDesc);
        } else if (Type.isPlayer(defender)) {
          player.sayL10n(l10n, 'NPC_MISS', attackerDesc);
        }
      }

      broadcastExceptPlayer(
        '<bold>'
        + attackerDesc
        + ' attacks '
        + defenderDesc
        + ' and '
        + missMessage
        + '</bold>');

      util.log(attackerDesc + ' misses ' + defenderDesc);

    }

    // If it hits...
    if (!missed) {

      // Begin assigning damage...
      const damage = this.isSecondAttack ?
        dualWieldDamage(attacker.combat.getDamage('offhand')) :
        attacker.combat.getDamage();
      util.log('Base damage for the ' + attackDesc + ': ', damage);

      // Actual damage based on location hit and armor...
      // The damage func has side effect of depleting defender's health.
      //TODO: Extract damage funcs to combat helper class.

      const damageDealt = defender.damage(damage, hitLocation);

      util.log(attackerDesc + ' targeted ' + attacker.combat.getTarget() + ' and hit ' + defenderDesc + ' in the ' + hitLocation + '.');
      let damageStr = getDamageString(damageDealt, defender.getAttribute('health'));

      //TODO: Add scripts for hitting with weapons.
      if (attackerWeapon && typeof attackerWeapon === 'object') {
        attackerWeapon.emit('hit', attacker, defender, damage);
      }

      //TODO: Add scripts for hitting and getting damaged to NPCs.
      attacker.emit('hit', attackerWeapon, defender, damage);
      defender.emit('damaged', attackerWeapon, attacker, damage);

      //TODO: This could be a method of util since this pattern is used in a couple of spots.
      if (Type.isPlayer(defender)) {
        util.log('wtf is hit location');
        util.log(hitLocation);
        player.sayL10n(l10n, 'DAMAGE_TAKEN', attackerDesc, damageStr, attackDesc, hitLocation);
      } else if (Type.isPlayer(attacker)) {
        player.sayL10n(l10n, 'DAMAGE_DONE', defenderDesc, damageStr, hitLocation);
      }

      broadcastExceptPlayer(
        '<bold><red>'
        + attackerDesc
        + ' attacks '
        + defender.combat.getDesc() +
        ' and '
        + damageStr
        + ' them!'
        + '</red></bold>');

        // If the defender is dealt a deathblow, end combat...
        if (defenderStartingHealth <= damage) {
          defender.setAttribute('health', 1);
          defender.setAttribute('sanity', 1);
          return combatEnd(Type.isPlayer(attacker));
        }

    }

    // Do sanity damage if applicable...
    if (sanityDamage) {
      defender.setAttribute('sanity', Math.max(defenderSanity - sanityDamage, 0));
    }

    // If the player is defending and still alive, see if they auto-flee.
    if (Type.isPlayer(defender)) {
      //FIXME: Check at end
      checkWimpiness(defenderStartingHealth);
    }

    // Display combat prompt.
    const getCondition = entity => {
        //FIXME: This could be a problem if the combat is between two NPCs or two players.
        //FIXME: The fix might have to go in statusUtils?
        const npc    = Type.isPlayer(entity) ? target : false;
        const max    = entity.getAttribute('max_health');
        return statusUtils.getHealthText(max, player, npc);
    };

    //FIXME: This is really jacked up right now.
    const getTargetCondition   = getCondition(defender);
    const getAttackerCondition = getCondition(attacker);

    if (Type.isPlayer(attacker)) {
      attacker.combatPrompt({
        target_condition: getTargetCondition(target.getAttribute('health')),
        player_condition: getAttackerCondition(attacker.getAttribute('health'))
      });
    }

    const nearbyFight = [
      "The sounds of a nearby struggle fill the air.",
      "From the sound of it, a mortal struggle is happening nearby.",
      "A cry from nearby! What could it be?",
      "The sounds of a clash echo nearby.",
      "You hear the sounds of flesh being rent, but you cannot tell from where.",
      "A thud, a muffled groan. Fighting nearby?"
    ];

    broadcastToArea(Random.fromArray(nearbyFight));

    setTimeout(this.combatRound, attackerSpeed);
  }

  //TODO: Add to utils helper.js file
  function getPercentage(numerator, denominator) {
    return Math.round((numerator / denominator) * 100);
  }

  function getDamageString(damage, health) {
    var percentage = getPercentage(damage, health);

    var damageStrings = {
      1: 'tickles',
      3: 'scratches',
      8: 'grazes',
      20: 'hits',
      35: 'wounds',
      85: 'maims',
    };

    for (var cutoff in damageStrings) {
      if (percentage <= cutoff) {
        return damageStrings[cutoff];
      }
    }
    return 'crushes';
  }

  function combatEnd(success) {

    util.log("*** Combat Over ***");

    player.setInCombat(false);
    target.setInCombat(false);

    //TODO: Handle PvP or NvN combat ending differently.
    if (success) {
      if (dualWieldCancel) { clearTimeout(dualWieldCancel); }

      const hasKilled = player.hasKilled(target);

      room.removeNpc(target.getUuid());
      npcs.destroy(target);
      player.sayL10n(l10n, 'WIN', target.getShortDesc(locale));
      broadcastExceptPlayer('<bold>'
        + target.getShortDesc(locale) +
        ' dies.</bold>');

      const exp = target.getAttribute('experience') ?
        target.getAttribute('experience') : LevelUtil.mobExp(target.getAttribute('level'));
      util.log("Player wins, exp gain: ", exp);
      player.emit('experience', exp);

    } else {
      util.log("** Player death: ", player.getName());
      player.sayL10n(l10n, 'LOSE', target.getShortDesc(locale));
      player.emit('die');

      broadcastExceptPlayer(player.getName() +
        ' collapses to the ground, life fleeing their body before your eyes.');

      //TODO: consider doing sanity damage to all other players in the room.
      broadcastExceptPlayer('<blue>A horrible feeling gnaws at the pit of your stomach.</blue>');
      target.setAttribute('health', npc.getAttribute('max_health'));

      broadcastToArea('The gurgles of a dying ' +
        statusUtils.getGenderNoun(player) +
        ' echo from nearby.'
      );
    }
    player.prompt();
    callback(success);
  }

  //TODO: Extract this to combat utils.
  function checkWimpiness(health) {
    var percentage = getPercentage(health, player.getAttribute('max_health'));
    var wimpiness = player.getPreference('wimpy')
    if (percentage < wimpiness) {
      util.log("Player's wimpiness kicks in...");
      util.log("Health: " + percentage + "% || Wimpiness: " + wimpiness + "%");
      player.say('You panic and try to flee.');
      Commands.player_commands.flee(null, player);
    }
  }

  //TODO: More candidates for utilification, I suppose.

  function broadcastExceptPlayer(msg) {
    players.eachExcept(player, function(p) {
      if (p.getLocation() === player.getLocation()) {
        p.say(msg);
        p.prompt();
      }
    });
  }

  function broadcastToArea(msg) {
    players.eachExcept(player, p => {
      const otherRoom = rooms.getAt(p.getLocation());
      const playerRoom = rooms.getAt(player.getLocation());
      const sameArea = otherRoom.getArea() === playerRoom.getArea();
      const notSameRoom = otherRoom !== playerRoom;

      if (sameArea && notSameRoom) {
        p.say(msg);
        p.prompt();
      }
    });
  }
}
