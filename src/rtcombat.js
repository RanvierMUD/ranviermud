'use strict';

module.exports.initCombat = _initCombat;

const util = require('util');
const _    = require('./helpers');

const Random      = require('./random.js').Random;
const LevelUtil   = require('./levels').LevelUtil;
const CommandUtil = require('./command_util').CommandUtil;
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
    const attackerWeapon = attacker.combat.getWeapon();
    const attackerWeaponName = attacker.combat.getPrimaryAttackName();

    // Assign constants for this round...
    const attackerSpeed = attacker.combat.getAttackSpeed(this.isSecondAttack);
    const attackerDesc  = attacker.getShortDesc('en');
    const defenderDesc  = defender.getShortDesc('en');
    const attackDesc    = attacker.combat.getPrimaryAttackName();

    const defenderStartingHealth = defender.getAttribute('health');

    // Log constants for this round...
    util.log(attackerDesc + ' has speed of ' + attackerSpeed + '.');
    util.log(attackerDesc + ' health: ' + attacker.getAttribute('health'));
    util.log(defenderDesc + ' health: ' + defenderStartingHealth + '.\n');
    util.log(attackerDesc + ' is attacking... ');

    // Decide where the hit lands
    const hitLocation = CombatUtil.decideHitLocation(defender.getBodyParts(), attacker.combat.getTarget(), false);

    const missed = attacker.combat.getToHitChance() <= defender.combat.getDodgeChance();

    if (!missed) {
      util.log('The attack hits!');

      // Begin assigning damage...
      const damage = attacker.combat.getDamage();
      util.log('Base damage for the ' + attackDesc + ': ', damage);

      // Actual damage based on hitLocation and armor...
      // The damage func has side effect of depleting defender's health.
      const damageDealt = defender.damage(damage, hitLocation);

      const attackerWeaponCanEmit = () => attackerWeapon && typeof attackerWeapon === 'object';

      if (attackerWeaponCanEmit()) {
        attackerWeapon.emit('hit', room, attacker, defender, players, hitLocation, damageDealt);
      }

      attacker.emit('hit', room, defender, players, hitLocation, damageDealt);
      defender.emit('damaged', room, attacker, players, hitLocation, damageDealt);

      util.log(attackerDesc + ' targeted ' + attacker.combat.getTarget() + ' and hit ' + defenderDesc + ' in the ' + hitLocation + '.');

      // If the defender is dealt a deathblow, end combat...
      if (defenderStartingHealth <= damage) {
        defender.setAttribute('health', 1);
        if (attackerWeaponCanEmit()) {
          attackerWeapon.emit('deathblow', room, attacker, defender, players, hitLocation);
        }
        attacker.emit('deathblow', room, attacker, defender, players, hitLocation);

        return combatEnd(Type.isPlayer(attacker));
      }
    }

    // If the player is defending and still alive, see if they auto-flee.
    if (Type.isPlayer(defender)) {
      checkWimpiness(defenderStartingHealth);
    }

    if (Type.isPlayer(player)) {
      player.combatPrompt();
    }

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
      room.removeNpc(target.getUuid());
      npcs.destroy(target);

      player.sayL10n(l10n, 'WIN', target.getShortDesc(locale));

      broadcastExceptPlayer('<bold>' + target.getShortDesc(locale) + ' dies.</bold>');

      const exp = target.getAttribute('experience') ?
        target.getAttribute('experience') :
        LevelUtil.mobExp(target.getAttribute('level'))
      ;
      util.log("Player wins, exp gain: ", exp);
      player.emit('experience', exp);
    } else {
      util.log("** Player death: ", player.getName());
      player.sayL10n(l10n, 'LOSE', target.getShortDesc(locale));
      player.fleeFromCombat();
      player.emit('die');

      broadcastExceptPlayer(player.getName() + ' collapses to the ground, life fleeing their body before your eyes.');
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
