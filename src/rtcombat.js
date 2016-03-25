module.exports.initiate_combat = _initiate_combat;
//TODO: Add strings for sanity damage
//TODO: Implement use of attributes besides damage in combat.
// ^^ this should be done in the npc/player src files
//TODO: Implement use of combat stance, etc. for strategery.
//FIXME: Combat ends when you die but you get double prompted.

var LevelUtils = require('./levels').LevelUtils;
var CommandUtil = require('./command_util').CommandUtil;
var statusUtils = require('./status');



function _initiate_combat(l10n, npc, player, room, npcs, players, callback) {
    var locale = player.getLocale();
    player.setInCombat(npc);
    npc.setInCombat(player.getName());

    player.sayL10n(l10n, 'ATTACK', npc.getShortDesc(locale));

    var p_locations = ['legs', 'feet', 'torso', 'hands', 'head'];

    var p = {
        isPlayer: true,
        name: player.getName(),
        speed: player.getAttackSpeed(),
        weapon: player.getEquipped('wield', true),
        locations: p_locations,
        target: 'body'
    };

    var n = {
        name: npc.getShortDesc(locale),
        speed: npc.getAttackSpeed(),
        weapon: npc.getAttack(locale),
        target: npc.getAttribute('target');
    };

    var npc_combat = combatRound.bind(null, npc, player, n, p);
    var player_combat = combatRound.bind(null, player, npc, p, n);

    setTimeout(npc_combat, n.speed);
    setTimeout(player_combat, p.speed);

    function combatRound(attacker, defender, a, d) {
        if (!defender.isInCombat() || !attacker.isInCombat()) return;

        var defender_health = defender.getAttribute('health');
        var damage = attacker.getDamage();
        var defender_sanity = defender.getAttribute('sanity');
        var sanityDamage = a.isPlayer ? 0 : attacker.getSanityDamage();
        var hitLocation = d.isPlayer ? decideHitLocation(d.locations, a.target) : 'body';

        if (d.isPlayer)

            damage = defender.damage(calcRawDamage(damage, defender_health), hitLocation);

        if (!damage) {

            if (d.weapon && typeof d.weapon == 'Object') d.weapon.emit('parry',
                defender);
            if (a.isPlayer) player.sayL10n(l10n, 'PLAYER_MISS', npc.getShortDesc(
                    locale),
                damage);
            else player.sayL10n(l10n, 'NPC_MISS', a.name);
            broadcastExceptPlayer('<bold>' + a.name + ' attacks ' + d.name +
                ' and misses!' + '</bold>');

        } else {

            var damageStr = getDamageString(damage, defender_health);

            if (a.weapon && typeof a.weapon == 'Object') a.weapon.emit('hit', player);
            if (d.isPlayer)
                player.sayL10n(l10n, 'DAMAGE_TAKEN', a.name, damageStr, a.weapon);
            else player.sayL10n(l10n, 'DAMAGE_DONE', d.name,
                damageStr);

            broadcastExceptPlayer('<bold><red>' + a.name + ' attacks ' + d.name +
                ' and ' + damageStr + ' them!' + '</red></bold>');

        }

        if (sanityDamage) {
            sanityDamage = calcRawDamage(sanityDamage, defender_sanity);
            defender.setAttribute('sanity', defender_sanity - sanityDamage);
        }

        if (defender_sanity <= sanityDamage || defender_health <= damage) {
            defender.setAttribute('health', 1);
            defender.setAttribute('sanity', 1);
            return combat_end(a.isPlayer);
        }

        defender.combatPrompt({
            target_condition: statusUtils.getHealthText(
                npc.getAttribute('max_health'),
                defender, npc)(npc.getAttribute('health')),
            player_condition: statusUtils.getHealthText(
                player.getAttribute('max_health'),
                player)(player.getAttribute('health'))
        });

        setTimeout(npc_combat, attacker.getAttackSpeed() *
            1000);
    }

    function decideHitLocations(locations, target) {
        if (CommandUtil.isCoinFlip()) {
            return target;
        } else return CommandUtil.getRandomFrommArr(locations);
    }

    function calcRawDamage(damage, attr) {
        var range = damage.max - damage.min;
        return Math.min(attr, damage.min + Math.max(0, Math.floor(Math.random() * (
            range))));
    }

    function getDamageString(damage, health) {
        var percentage = Math.round((damage / health) * 100);

        var damageStrings = {
            3: 'tickles',
            5: 'scratches',
            8: 'grazes',
            15: 'hits',
            35: 'wounds',
            50: 'devastates',
            75: 'annihilates',
            99: 'eviscerates'
        };

        for (var cutoff in damageStrings) {
            if (percentage <= cutoff) {
                return damageStrings[cutoff];
            }
        }
        return 'slays';
    }

    function combat_end(success) {
        
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
                npc.getAttribute('experience') : LevelUtils.mobExp(npc.getAttribute('level'));

            player.emit('experience', exp);
        } else {
           
            player.sayL10n(l10n, 'LOSE', npc.getShortDesc(locale));
            player.emit('die');
            broadcastExceptPlayer(player.getName() +
                ' collapses to the ground, life fleeing their body before your eyes.'
            );
            
            //TODO: consider doing sanity damage to all other players in the room.
            players.broadcastExcept(player,
                '<blue>A horrible feeling gnaws at the pit of your stomach.</blue>');
            npc.setAttribute('health', npc.getAttribute('max_health'));
            player.broadcastToArea("The horrific scream of a dying " + statusUtils.getGenderNoun(player) + " echoes from nearby.");
        }
        player.prompt();
        callback(success);
    }

    function broadcastExceptPlayer(msg) {
        players.eachExcept(player, function(p) {
            if (p.getLocation() === player.getLocation()) {
                p.say(msg);
                p.prompt();
            }
        });
    }

    function broadcastToArea(msg) {
        players.eachExcept(player, function(p) {
            if (p.getLocation().getArea() === player.getLocation().getArea()) {
                p.say(msg);
                p.prompt();
            }
        });
    }
}
