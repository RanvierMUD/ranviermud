module.exports.initiate_combat = _initiate_combat;
//TODO: Add strings for sanity damage
var Random = require('./random.js').Random;
var LevelUtil = require('./levels')
  .LevelUtil;
var CommandUtil = require('./command_util')
  .CommandUtil;
var util = require('util');
var statusUtils = require('./status');
var Commands = require('./commands').Commands;


function _initiate_combat(l10n, npc, player, room, npcs, players, rooms, callback) {
  var locale = player.getLocale();
  player.setInCombat(npc);
  npc.setInCombat(player.getName());

  player.sayL10n(l10n, 'ATTACK', npc.getShortDesc(locale));

  var p_locations = [
    'legs',
    'feet',
    'torso',
    'hands',
    'head'
  ];

  var p = {
    isPlayer: true,
    name: player.getName(),
    speed: player.getAttackSpeed(),
    weapon: player.getEquipped('wield', true),
    locations: p_locations,
    target: player.getPreference('target') || 'body',
  };

  var n = {
    name: npc.getShortDesc(locale),
    speed: npc.getAttackSpeed(),
    weapon: npc.getAttack(locale),
    target: npc.getAttribute('target'),
    locations: npc.getLocations()
  };

  try {
    util.log("Combat begins between " + p.name + " and " + n.name);
    util.log("Weapons are " + p.weapon + ' and ' + n.weapon);
    util.log("Speeds are " + p.speed + ' vs. ' + n.speed)
  } catch (e) { util.log(e); }

  var player_combat = combatRound.bind(null, player, npc, p, n);
  var npc_combat = combatRound.bind(null, npc, player, n, p);

  p.attackRound = player_combat;
  n.attackRound = npc_combat;

  setTimeout(npc_combat, n.speed);
  setTimeout(player_combat, p.speed);

  function combatRound(attacker, defender, a, d) {

    if (!defender.isInCombat() || !attacker.isInCombat())
      return;

    var starting_health = defender.getAttribute('health');
    util.log(a.name + ' health: ' + attacker.getAttribute('health'));
    util.log(d.name + ' health: ' + defender.getAttribute('health'));

    if (d.isPlayer) checkWimpiness(starting_health);

    var damage = attacker.getDamage();
    var defender_sanity = defender.getAttribute('sanity');
    var sanityDamage = a.isPlayer ? 0 : attacker.getSanityDamage();
    var hitLocation = decideHitLocation(d.locations, a.target, isPrecise());

    function isPrecise() {
      return a.isPlayer ? attacker.checkStance('precise') : false;
    }


    if (!damage) {

      if (d.weapon && typeof d.weapon == 'Object')
        d.weapon.emit('parry', defender);

      if (a.isPlayer)
        player.sayL10n(l10n, 'PLAYER_MISS', n.name, damage);

      else
        player.sayL10n(l10n, 'NPC_MISS', a.name);

      broadcastExceptPlayer(
        '<bold>' + a.name + ' attacks ' + d.name +
        ' and misses!' + '</bold>');
      util.log(a.name + ' misses ' + d.name);

    } else {

      damage = defender.damage(
        calcRawDamage(damage, defender.getAttribute('health')),
        hitLocation);

      util.log('Targeted ' + a.target + ' and hit ' + hitLocation);
      var damageStr = getDamageString(damage, defender.getAttribute('health'));

      if (a.weapon && typeof a.weapon == 'Object')
        a.weapon.emit('hit', player);

      if (d.isPlayer)
        player.sayL10n(l10n, 'DAMAGE_TAKEN', a.name, damageStr, a.weapon, hitLocation);

      else player.sayL10n(l10n, 'DAMAGE_DONE', d.name, damageStr, hitLocation);

      broadcastExceptPlayer('<bold><red>' + a.name + ' attacks ' + d.name +
        ' and ' + damageStr + ' them!' + '</red></bold>');

    }

    if (sanityDamage) {
      sanityDamage = calcRawDamage(sanityDamage, defender_sanity);
      defender.setAttribute('sanity', Math.max(defender_sanity - sanityDamage, 0));
    }

    if (starting_health <= damage) {
      defender.setAttribute('health', 1);
      defender.setAttribute('sanity', 1);
      return combat_end(a.isPlayer);
    }

    player.combatPrompt({
      target_condition: statusUtils.getHealthText(
        npc.getAttribute('max_health'),
        player, npc)(npc.getAttribute('health')),
      player_condition: statusUtils.getHealthText(
        player.getAttribute('max_health'),
        player, false)(player.getAttribute('health'))
    });

    var nearbyFight = [
      "The sounds of a nearby struggle fill the air.",
      "From the sound of it, a mortal struggle is happening nearby.",
      "A cry from nearby! What could it be?",
      "The sounds of a clash echo nearby.",
      "You hear the sounds of flesh being rent, but you cannot tell from where."
    ];

    broadcastToArea(Random.fromArray(nearbyFight));

    setTimeout(a.attackRound, a.speed);
  }

  function decideHitLocation(locations, target, precise) {
    if (precise || Random.coinFlip()) {
      return target;
    } else return Random.fromArray(locations);
  }

  function calcRawDamage(damage, attr) {
    var range = damage.max - damage.min;
    with(Math) {
      return min(
        attr,
        damage.min + max(
          0,
          floor(random() * (range))
        )
      );
    }
  }

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

      player.emit('regen');
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
