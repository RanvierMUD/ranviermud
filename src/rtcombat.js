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
  const playerCombat = combatRound.bind({}, player, target);
  const targetCombat = combatRound.bind({}, target, player);

  player.combat.combatRound = playerCombat;
  target.combat.combatRound = targetCombat;

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

  let isDualWielding  = CommandUtil.hasScript(player.combat.getOffhand(), 'wield');
  let getDuelWieldSpeed  = () => player.combat.getAttackSpeed(isDualWielding) * dualWieldSpeedFactor;
  let dualWieldDamage = damage => Math.round(damage * (0.5 + player.getSkills('dual') / 10));
  let dualWieldCancel = null;

  if (isDualWielding) {
    util.log("Player is using dual wield!");
    const dualWieldCombat = combatRound.bind({ secondAttack: true }, player, npc);
    secondAttack.attackRound = dualWieldCombat;
    dualWieldCancel = setTimeout(dualWieldCombat, getDuelWieldSpeed());
  }

  function combatRound(attacker, defender) {

    const slowAttacker = Type.isPlayer(attacker) && !attacker.hasEnergy(2);
    if (slowAttacker) {

      //TODO: Consider adding to Effects file instead of here.
      attacker.addEffect('tired', {
        duration: 5000,
        activate: () => {
          if (!attacker.getEffects('tired')) {
            attacker.combat.addSpeedMod({
              name:  'tired',
              effect: speed => speed * 2,
            });
            attacker.combat.addDamageMod({
              name:  'tired',
              effect: damage => damage * .75,
            });
            attacker.combat.addToHitMod({
              name:  'tired',
              effect: toHit => toHit * .75,
            });
            attacker.combat.addDodgeMod({
              name:  'tired',
              effect: dodge => dodge * .5
            });
          }
        },
        deactivate: () => attacker.combat.removeAllMods('tired'),
      });
    }

    util.log("Speeds are " + attacker.combat.getAttackSpeed(this.isSecondAttack) + ' vs. ' + defender.combat.getAttackSpeed());

    //TODO: Remove this when allowing for multicombat.
    //TODO: Use an array of targets for multicombat.
    if (!defender.isInCombat() || !attacker.isInCombat()) { return; }

    const startingHealth = defender.getAttribute('health');
    util.log(attacker.combat.getDesc() + ' health: ' + attacker.getAttribute('health'));
    util.log(defender.combat.getDesc() + ' health: ' + defender.getAttribute('health'));

    if (Type.isPlayer(defender)) {
      //FIXME: Check at end
      checkWimpiness(startingHealth);
    }

    if (this.isSecondAttack) { util.log('** Offhand attack: '); }

    let damage = this.isSecondAttack ?
      dualWieldDamage(attacker.combat.getDamage('offhand')) : attacker.combat.getDamage();

    const defenderSanity = defender.getAttribute('sanity');
    const sanityDamage = Type.isPlayer(defender) ?
      attacker.getSanityDamage() : 0; //TODO: Extract into module.

    //TODO: Extract to module.
    const hitLocation = decideHitLocation(defender.getBodyParts(), attacker.combat.getTarget(), isPrecise());

    function isPrecise() {
      return Type.isPlayer(attacker) ?
        attacker.checkStance('precise') : false;
    }

    //TODO: Do toHit check before/instead of checking for a lack of damage.
    const missed = attacker.combat.getToHitChance() < defender.combat.getDodgeChance();
    if (!damage || missed) {

      //FIXME: What if the defender is an npc?
      const defenderWeapon = defender.combat.getWeapon();
      if (defenderWeapon && CommandUtil.hasScript(defenderWeapon, 'parry')) {
        util.log('def weapon', defenderWeapon);
        defenderWeapon.emit('parry', defender);
      }

      if (Type.isPlayer(attacker)) {
        player.sayL10n(l10n, 'PLAYER_MISS', defender.combat.getDesc(), damage);
      } else if (Type.isPlayer(defender)) {
        player.sayL10n(l10n, 'NPC_MISS', attacker.combat.getDesc());
      }

      broadcastExceptPlayer(
        '<bold>'
        + attacker.combat.getDesc()
        + ' attacks '
        + defender.combat.getDesc()
        + ' and misses!' + '</bold>');

      util.log(attacker.combat.getDesc() + ' misses ' + defender.combat.getDesc());

    } else {

      damage = defender.damage(
        calcRawDamage(damage, defender.getAttribute('health')),
        hitLocation);

      util.log('Targeted ' + attacker.combat.getTarget() + ' and hit ' + hitLocation);
      var damageStr = getDamageString(damage, defender.getAttribute('health'));

      const attackerWeapon = this.isSecondAttack ?
        attacker.combat.getOffhand() :
        attacker.combat.getWeapon();

      const attackerAttack = this.isSecondAttack ?
        attacker.combat.getSecondaryAttackName() :
        attacker.combat.getPrimaryAttackName();

      if (attackerWeapon && typeof attackerWeapon === 'object') {
        attackerWeapon.emit('hit', attacker, defender);
      }

      //TODO: This could be a method of util since this pattern is used in a couple of spots.
      // Check to
      if (Type.isPlayer(defender)) {
        player.sayL10n(l10n, 'DAMAGE_TAKEN', attacker.combat.getDesc(), damageStr, attackerAttack, hitLocation);
      } else if (Type.isPlayer(attacker)){
        player.sayL10n(l10n, 'DAMAGE_DONE', defender.combat.getDesc(), damageStr, hitLocation);
      }

      broadcastExceptPlayer(
        '<bold><red>'
        + attacker.combat.getDesc()
        + ' attacks '
        + defender.combat.getDesc() +
        ' and '
        + damageStr
        + ' them!'
        + '</red></bold>');

    }

    if (sanityDamage) {
      sanityDamage = calcRawDamage(sanityDamage, defenderSanity);
      defender.setAttribute('sanity', Math.max(defenderSanity - sanityDamage, 0));
    }

    if (startingHealth <= damage) {
      defender.setAttribute('health', 1);
      defender.setAttribute('sanity', 1);
      return combatEnd(Type.isPlayer(attacker));
    }

    const getCondition = entity => {
        //FIXME: This could be a problem if the combat is between two NPCs or two players.
        //FIXME: The fix might have to go in statusUtils?
        const npc    = Type.isPlayer(entity) ? target : false;
        const max    = entity.getAttribute('max_health');
        return statusUtils.getHealthText(max, player, npc);
    };
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
    setTimeout(attacker.combat.attackRound, attacker.combat.getAttackSpeed());
  }

  function decideHitLocation(locations, target, precise) {
    if (precise || Random.coinFlip()) {
      return target;
    } else return Random.fromArray(locations);
  }

  function calcRawDamage(damage, attr) {
    const range = damage.max - damage.min;
    return Math.max(
      Random.inRange(damage.min, damage.max) + attr,
      attr,
      range
    );
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
