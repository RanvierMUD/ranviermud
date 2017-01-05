'use strict';

module.exports.initCombat = _initCombat;

//TODO: Add strings for sanity damage

const util = require('util');
const _    = require('./helpers');

const Random      = require('./random.js').Random;
const LevelUtil   = require('./levels').LevelUtil;
const CommandUtil = require('./command_util').CommandUtil;
const statusUtils = require('./status');
const Commands    = require('./commands').Commands;
const CombatUtil  = require('./combat_util').CombatUtil;
const Type        = require('./type').Type;
const Effects     = require('./effects').Effects;
const Broadcast   = require('./broadcast').Broadcast;

let dualWieldCancel = null; //FIXME: Could this be a problem with multiple players in combat all at once?

function _initCombat(l10n, target, player, room, npcs, players, rooms, items, callback) {
  const locale = 'en';
  player.setInCombat(target);
  target.setInCombat(player);

  const broadcastToArea = Broadcast.toArea(player, players, rooms);

  player.sayL10n(l10n, 'ATTACK', target.getShortDesc('en'));


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
   * to the context for the combat round.
   * Sounds circular (and it is), but it works.
   * Then, invoke a timeout for each combatant's round.
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

  if (isDualWielding) {
    util.log("Player is using dual wield!");
    const secondAttack = {
      isSecondAttack: true,
    }
    const dualWieldCombat = combatRound.bind(secondAttack, player, target);
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
   * Determine hit location.
   * See if the attack hits (toHit vs Dodge)
   * If it misses, see if it is parried, dodged, or just misses.
   * If it hits, see how much damage it does.
   * Appy damage to defender & broadcast/emit hitting.
   * See if defender is dead.
   * Apply sanity damage
   * Check for auto-flee.
   * Do combat prompt.
   * Broadcast to surrounding area.
   * Do it all again.
   *
   * @param attacker
   * @param defender
   */

  function combatRound(attacker, defender) {

    // Handle if attacker or defender is already in combat...
    //TODO: Remove this when allowing for multicombat.
    //TODO: Use an array of targets for multicombat.
    if (!defender.isInCombat() || !attacker.isInCombat()) { return; }

    // Assign weapon obj and name.
    const attackerWeapon = this.isSecondAttack ?
      attacker.combat.getOffhand() :
      attacker.combat.getWeapon();
    const attackerWeaponName = this.isSecondAttack ?
      attacker.combat.getSecondaryAttackName() :
      attacker.combat.getPrimaryAttackName();

    // Handle energy costs for attacking.
    const baseEnergyCost = 2;
    const isPlayerWithWeapon = Type.isPlayer(attacker) && attackerWeapon && attackerWeapon.getAttribute;
    const energyCost = isPlayerWithWeapon ?
      attackerWeapon.getAttribute('weight') || baseEnergyCost :
      baseEnergyCost;
    util.log('Attack energy cost for ' + attacker.getShortDesc('en') + ' is ' + energyCost);

    // Handle attacker fatigue
    const slowAttacker = Type.isPlayer(attacker) && !attacker.hasEnergy(energyCost, items);
    if (slowAttacker) {
      attacker.combat.addSpeedMod({
        name: 'fatigue',
        modifier: speed => speed + 1000
      });
      attacker.combat.addDodgeMod({
        name: 'fatigue',
        modifier: dodge => Math.max(dodge - 3, 1)
      });
      attacker.combat.addToHitMod({
        name: 'fatigue',
        modifier: toHit => Math.max(toHit - 3, 1)
      });
    } else {
      attacker.combat.removeAllMods('fatigue');
    }

    // Handle attacker sanity effects...
    const stressedLimit = 40;
    const stressedAttacker = Type.isPlayer(attacker) && attacker.getAttribute('sanity') <= stressedLimit;
    if (stressedAttacker) {
      attacker.addEffect('stressed', {
        name: 'Stressed',
        type: 'stupefy',
        aura: 'intense stress',
        percentage: .9
      });

      const insanityLimit = 20;
      if (attacker.getAttribute('sanity') > insanityLimit) {
        //TODO: Make a custom insanity effect with events and such?
        attacker.addEffect('insanity', {
          name: 'Insane',
          type: 'stupefy',
          aura: 'insanity',
          cost: 3,
          percentage: .5,
          desc: 'You seem to have entirely lost your wits.'
        });
      }
    }


    // Assign constants for this round...
    const attackerSpeed = attacker.combat.getAttackSpeed(this.isSecondAttack);
    const attackerDesc  = attacker.getShortDesc('en');
    const defenderDesc  = defender.getShortDesc('en');
    const attackDesc    = this.isSecondAttack ?
      attacker.combat.getSecondaryAttackName() :
      attacker.combat.getPrimaryAttackName();

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
      attacker.combat.getSanityDamage() || 0 :
      0;

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
      const defenderWeapon = defender.combat.getWeapon();
      const canParry = defenderWeapon ?
        CommandUtil.hasScript(defenderWeapon, 'parry') :
        CommandUtil.hasScript(defender, 'parry');
      const canDodge = CommandUtil.hasScript(defender, 'dodge');

      const parrySkill = Type.isPlayer(defender) ?
        defender.getSkills('parrying') + defender.getAttribute('cleverness') :
        defender.getAttribute('speed') * 2;
      const dodgeSkill = Type.isPlayer(defender) ?
        defender.getSkills('dodging') + defender.getAttribute('quickness') :
        defender.getAttribute('speed') * 2;

      if (canParry && parrySkill > Random.roll()) {
        util.log('The attack is parried!');
        if (defenderWeapon && CommandUtil.hasScript(defenderWeapon, 'parry')) {
          defenderWeapon.emit('parry', room, defender, attacker, players);
        } else {
          defender.emit('parry', attacker, room, players, hitLocation);
        }
      } else if (canDodge && dodgeSkill > Random.roll()) {
        util.log('They dodge!');
        defender.emit('dodge', room, attacker, players, hitLocation);

      // If it is just a regular ole miss...
      //TODO: What if there are no players involved in combat?
      } else {
        if (attackerWeapon && CommandUtil.hasScript(attackerWeapon, 'missedAttack')) {
          attackerWeapon.emit('missedAttack', room, defender, attacker, players, hitLocation);
        } else {
          attacker.emit('missedAttack', room, defender, players, hitLocation);
        }
      }

      util.log(attackerDesc + ' misses ' + defenderDesc);
    }

    if (!missed) {
      util.log('The attack hits!');

      // Begin assigning damage...
      const damage = this.isSecondAttack ?
        dualWieldDamage(attacker.combat.getDamage('offhand')) :
        attacker.combat.getDamage();
      util.log('Base damage for the ' + attackDesc + ': ', damage);

      // Actual damage based on hitLocation and armor...
      // The damage func has side effect of depleting defender's health.
      const damageDealt = defender.damage(damage, hitLocation);

      const attackerWeaponCanEmit = () => attackerWeapon && typeof attackerWeapon === 'object';

      if (attackerWeaponCanEmit()) {
        attackerWeapon.emit('hit', room, attacker, defender, players, hitLocation, damageDealt);
      } else {
        attacker.emit('hit', room, defender, players, hitLocation, damageDealt);
      }
      defender.emit('damaged', room, attacker, players, hitLocation, damageDealt);

      util.log(attackerDesc + ' targeted ' + attacker.combat.getTarget() + ' and hit ' + defenderDesc + ' in the ' + hitLocation + '.');

        // If the defender is dealt a deathblow, end combat...
        if (defenderStartingHealth <= damage) {
          defender.setAttribute('health', 1);
          defender.setAttribute('sanity', 1);
          if (attackerWeaponCanEmit()) {
            attackerWeapon.emit('deathblow', room, attacker, defender, players, hitLocation);
          }
          attacker.emit('deathblow', room, attacker, defender, players, hitLocation);

          return combatEnd(Type.isPlayer(attacker));
        }

    }

    // Do sanity damage if applicable...
    if (sanityDamage && defenderSanity) {
      defender.setAttribute('sanity', Math.max(defenderSanity - sanityDamage, 0));
    }

    // If the player is defending and still alive, see if they auto-flee.
    if (Type.isPlayer(defender)) {
      checkWimpiness(defenderStartingHealth);
    }

    // Display combat prompt.
    const getCondition = entity => {
        //FIXME: In statusUtils: This could be a problem if the combat is between two NPCs or two players.
        const npc    = Type.isPlayer(entity) ? target : false;
        const max    = entity.getAttribute('max_health');
        return statusUtils.getHealthText(max, player, npc);
    };


    if (Type.isPlayer(player)) {
      player.combatPrompt({
        target_condition: statusUtils.getHealthText(
          target.getAttribute('max_health'),
          player, target)(target.getAttribute('health')),
        player_condition: statusUtils.getHealthText(
          player.getAttribute('max_health'),
          player, false)(player.getAttribute('health'))
      });
    }


    // Make those in area aware of nearby combat...
    const nearbyFight = [
      "The sounds of a nearby struggle fill the air.",
      "From the sound of it, a mortal struggle is happening nearby.",
      "A cry from nearby! What could it be?",
      "The sounds of a clash echo nearby.",
      "You hear the sounds of flesh being rent, but you cannot tell from where.",
      "A thud, a muffled groan. Fighting nearby?"
    ];

    if (Random.coinFlip()) { broadcastToArea(Random.fromArray(nearbyFight)); }

    // Do it all over again...
    setTimeout(this.combatRound, attackerSpeed);
  }

  //TODO: Add to utils helper.js file
  function getPercentage(numerator, denominator) {
    return Math.round((numerator / denominator) * 100);
  }

  function combatEnd(success) {

    util.log("*** Combat Over ***");

    player.removeFromCombat(target);
    target.removeFromCombat(player);

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
      player.emit('experience', exp, 'killing and survival');

    } else {
      util.log("** Player death: ", player.getName());
      player.sayL10n(l10n, 'LOSE', target.getShortDesc(locale));
      player.fleeFromCombat();
      player.emit('die');

      broadcastExceptPlayer(player.getName() + ' collapses to the ground, life fleeing their body before your eyes.');

      broadcastExceptPlayer('<blue>A horrible feeling gnaws at the pit of your stomach.</blue>');
      broadcastToArea('The gurgles of a dying ' + statusUtils.getGenderNoun(player) + ' echo from nearby.');

      players.eachIf(
        p => p.getLocation() === room.getLocation(),
        p => p.emit('sanityLoss', 'witnessing gruesome death first-hand', 50)
      );
    }
    player.prompt();
    if (callback) { callback(success); }
  }

  //TODO: Extract this to combat utils.
  //TODO: Make NPCs have fleeing behavior, too.
  //TODO: Emit flee?
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

  //TODO: Use Broadcast module or extract to the Broadcast file.

  function broadcastExceptPlayer(msg) {
    players.eachExcept(player, p => {
      if (p.getLocation() === player.getLocation()) {
        p.say(msg);
        p.prompt();
      }
    });
  }

}
