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

function _initCombat(l10n, npc, player, room, npcs, players, rooms, callback) {
  const locale = player.getLocale();
  player.setInCombat(npc);
  npc.setInCombat(player);

  player.sayL10n(l10n, 'ATTACK', npc.getShortDesc(locale));


  /*
    Ideas:

    To hit vs. Dodge:
      Dodge = chance of auto-dodge, or does it need to be manual?
              Leave open to potential manual dodging in future.
      ToHit = chance of hitting the enemy. Potentially,
              chance of hitting = (toHitRoll - dodgeChance) vs. EnemyLevel?
              Gah.

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



  try {
    util.log("Combat begins between " + p.name + " and " + n.name);
    util.log("Weapons are " + p.weapon.getShortDesc('en') + ' and ' + n.weapon);
    util.log("Speeds are " + p.speed() + ' vs. ' + n.speed());
  } catch (e) { util.log(e); }

  var playerCombat = combatRound.bind(null, player, npc);
  var npcCombat = combatRound.bind(null, npc, player);

  p.attackRound = playerCombat;
  n.attackRound = npcCombat;

  setTimeout(npcCombat, n.speed());
  setTimeout(playerCombat, p.speed());

  var isDualWielding = CommandUtil.hasScript(p.offhand, 'wield');
  var dualWieldSpeed = () => p.speed() * (2.1 - player.getSkills('dual') / 10);
  var dualWieldDamage = damage => Math.round(damage * (0.5 + player.getSkills('dual') / 10));
  var dualWieldCancel = null;

  if (isDualWielding) {
    util.log("Player is using dual wield!");
    var pWithDual = Object.assign({}, p, { weapon: p.offhand });
    var dualWieldCombat = combatRound.bind({ secondAttack: true }, player, npc, pWithDual, n);
    pWithDual.attackRound = dualWieldCombat;
    dualWieldCancel = setTimeout(dualWieldCombat, dualWieldSpeed());
  }

  function combatRound(attacker, defender) {

    // Try to standardize function calls so this is not necessary.

    const attackerHelper = getCombatHelper(attacker);
    const defenderHelper = getCombatHelper(defender);


    const slowAttacker = Type.isPlayer(attacker) && !attacker.hasEnergy(2);
    if (slowAttacker) {
      //TODO: Set an effect instead if possible.
      attackerHelper.speed = () => attacker.getAttackSpeed() * 4;
    }

    util.log("Speeds are " + attackerHelper.speed() + ' vs. ' + defenderHelper.speed());

    //TODO: Remove this when allowing for multicombat.
    if (!defender.isInCombat() || !attacker.isInCombat()) { return; }

    const startingHealth = defender.getAttribute('health');
    util.log(attackerHelper.name + ' health: ' + attacker.getAttribute('health'));
    util.log(defenderHelper.name + ' health: ' + defender.getAttribute('health'));

    if (Type.isPlayer(defender)) {
      //FIXME: Extract to module
      checkWimpiness(startingHealth);
    }

    if (this.isSecondAttack) { util.log('Offhand attack: '); }

    //TODO: Extract to module
    var damage = this.isSecondAttack ?
      dualWieldDamage(attacker.getDamage('offhand')) : attacker.getDamage();
    var defender_sanity = defender.getAttribute('sanity');
    var sanityDamage = attackerHelper.isPlayer ?
      0 : attacker.getSanityDamage();
    var hitLocation = decideHitLocation(d.locations, attackerHelper.target, isPrecise());

    function isPrecise() {
      return attackerHelper.isPlayer ? attacker.checkStance('precise') : false;
    }

    if (!damage) {

      if (d.weapon && typeof d.weapon == 'object') {
        d.weapon.emit('parry', defender);
      }

      if (attackerHelper.isPlayer) {
        player.sayL10n(l10n, 'PLAYER_MISS', n.name, damage);
      } else {
        player.sayL10n(l10n, 'NPC_MISS', attackerHelper.name);
      }

      broadcastExceptPlayer(
        '<bold>' + attackerHelper.name + ' attacks ' + d.name +
        ' and misses!' + '</bold>');

      util.log(attackerHelper.name + ' misses ' + d.name);

    } else {

      damage = defender.damage(
        calcRawDamage(damage, defender.getAttribute('health')),
        hitLocation);

      util.log('Targeted ' + attackerHelper.target + ' and hit ' + hitLocation);
      var damageStr = getDamageString(damage, defender.getAttribute('health'));

      if (attackerHelper.weapon && typeof attackerHelper.weapon == 'object') {
        attackerHelper.weapon.emit('hit', player);
      }

      if (d.isPlayer) {
        player.sayL10n(l10n, 'DAMAGE_TAKEN', attackerHelper.name, damageStr, attackerHelper.weapon, hitLocation);
      } else {
        player.sayL10n(l10n, 'DAMAGE_DONE', d.name, damageStr, hitLocation);
      }

      broadcastExceptPlayer('<bold><red>' + attackerHelper.name + ' attacks ' + d.name +
        ' and ' + damageStr + ' them!' + '</red></bold>');

    }

    if (sanityDamage) {
      sanityDamage = calcRawDamage(sanityDamage, defender_sanity);
      defender.setAttribute('sanity', Math.max(defender_sanity - sanityDamage, 0));
    }

    if (startingHealth <= damage) {
      defender.setAttribute('health', 1);
      defender.setAttribute('sanity', 1);
      return combat_end(attackerHelper.isPlayer);
    }

    const getCondition = entity => {
        const npc    = Type.isPlayer(entity) ? npc : false;
        const max    = entity.getAttribute('max_health');
        return statusUtils.getHealthText(max, player, npc);
    };

    player.combatPrompt({
      target_condition: getCondition(npc)(npc.getAttribute('health')),
      player_condition: getCondition(player)(player.getAttribute('health'))
    });

    const nearbyFight = [
      "The sounds of a nearby struggle fill the air.",
      "From the sound of it, a mortal struggle is happening nearby.",
      "A cry from nearby! What could it be?",
      "The sounds of a clash echo nearby.",
      "You hear the sounds of flesh being rent, but you cannot tell from where.",
      "A thud, a muffled groan. Fighting nearby?"
    ];

    broadcastToArea(Random.fromArray(nearbyFight));
    setTimeout(attackerHelper.attackRound, attackerHelper.speed());
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

  function combat_end(success) {

    util.log("*** Combat Over ***");

    player.setInCombat(false);
    npc.setInCombat(false);

    if (success) {
      if (dualWieldCancel) { clearTimeout(dualWieldCancel); }

      var hasKilled = player.hasKilled(npc);

      room.removeNpc(npc.getUuid());
      npcs.destroy(npc);
      player.sayL10n(l10n, 'WIN', npc.getShortDesc(locale));
      broadcastExceptPlayer('<bold>' + npc.getShortDesc(locale) +
        ' dies.</bold>');

      // hand out experience
      var exp = npc.getAttribute('experience') !== false ?
        npc.getAttribute('experience') : LevelUtil.mobExp(npc.getAttribute('level'));
      util.log("Player wins, exp gain: ", exp);
      player.emit('experience', exp);

    } else {
      util.log("Player death: ", player.getName());
      player.sayL10n(l10n, 'LOSE', npc.getShortDesc(locale));
      player.emit('die');

      broadcastExceptPlayer(player.getName() +
        ' collapses to the ground, life fleeing their body before your eyes.'
      );

      //TODO: consider doing sanity damage to all other players in the room.
      broadcastExceptPlayer('<blue>A horrible feeling gnaws at the pit of your stomach.</blue>');
      npc.setAttribute('health', npc.getAttribute('max_health'));

      broadcastToArea('The gurgles of a dying ' +
        statusUtils.getGenderNoun(player) +
        ' echo from nearby.'
      );
    }
    player.prompt();
    callback(success);
  }

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
