var Effects = require('./effects.js').Effects;

var l10n_dir = __dirname + '/../l10n/skills/';
var l10ncache = {};
/**
 * Localization helper
 * @return string
 */

//FIXME: This entire skill system, lulz.

var L = function(locale, cls, key /*, args... */ ) {
  var l10n_file = l10n_dir + cls + '.yml';
  var l10n = l10ncache[cls + locale] || require('./l10n')(l10n_file);
  l10n.setLocale(locale);
  return l10n.translate.apply(null, [].slice.call(arguments).slice(2));
};
exports.Skills = {
  mental: {
    stun: {
      type: 'active',
      cost: 1,
      // no prereqs
      name: "Stun",
      description: "Stun your opponent for physical damage. Target's attacks are slower for 5 seconds following the attack.",
      cooldown: 4,
      activate: function(player, args, rooms, npcs) {
        if (!player.isInCombat()) {
          player.say(L(player.getLocale(), 'warrior', 'TACKLE_NOCOMBAT'));
          return true;
        }

        if (player.getEffects('cooldown_tackle')) {
          player.say(L(player.getLocale(), 'warrior', 'TACKLE_COOLDOWN'));
          return true;
        }

        var target = player.isInCombat();
        if (!target) {
          player.say("Somehow you're in combat with a ghost");
          return true;
        }

        var damage = Math.min(target.getAttribute('max_health'), Math.ceil(player.getDamage().max * 1.2));

        player.say(L(player.getLocale(), 'warrior', 'TACKLE_DAMAGE', damage));
        target.setAttribute('health', target.getAttribute('health') - damage);

        if (!target.getEffects('slow')) {
          target.addAffect('slow', Effects.slow({
            duration: 3,
            magnitude: 1.5,
            player: player,
            target: target,
            deactivate: function() {
              player.say(L(player.getLocale(), 'warrior', 'TACKLE_RECOVER'));
            }
          }));
        }

        // Slap a cooldown on the player
        player.addAffect('cooldown_tackle', {
          duration: 4,
          deactivate: function() {
            player.say(L(player.getLocale(), 'warrior', 'TACKLE_COOLDOWN_END'));
          }
        });

        return true;
      }
    }
  },
  physical: {
    leatherskin: {
      type: 'passive',
      cost: 2,
      // no prereqs
      name: "Leatherskin",
      description: "Your skin has become tougher, and you are better able to take physical damage.",
      activate: function(player) {
        if (player.getEffects('leatherskin')) {
          player.removeEffect('leatherskin');
        }
        player.addEffect('leatherskin', Effects.health_boost({
          magnitude: 50,
          //consider adding +1 to stamina
          player: player,
          event: 'quit'
        }));
      }
    }
  }
};
