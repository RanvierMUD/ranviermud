var Affects  = require('./affects.js').Affects;

var l10n_dir = __dirname + '/../l10n/skills/';
var l10ncache = {};
/**
 * Localization helper
 * @return string
 */
var L = function (locale, cls, key /*, args... */)
{
	var l10n_file = l10n_dir + cls + '.yml';
	var l10n = l10ncache[cls+locale] || require('./l10n')(l10n_file);
	l10n.setLocale(locale);
	return l10n.translate.apply(null, [].slice.call(arguments).slice(2));
};

exports.Skills = {
	warrior: {
		tackle: {
			type: 'active',
			level: 2,
			name: "Tackle",
			description: "Tackle your opponent for 120% weapon damage. Target's attacks are slower for 5 seconds following the attack.",
			cooldown: 4,
			activate: function (player, args, rooms, npcs)
			{
				if (!player.isInCombat()) {
					player.say(L(player.getLocale(), 'warrior', 'TACKLE_NOCOMBAT'));
					return true;
				}

				if (player.getAffects('cooldown_tackle')) {
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

				if (!target.getAffects('slow')) {
					target.addAffect('slow', Affects.slow({
						duration: 3,
						magnitude: 1.5,
						player: player,
						target: target,
						deactivate: function () {
							player.say(L(player.getLocale(), 'warrior', 'TACKLE_RECOVER'));
						}
					}));
				}

				// Slap a cooldown on the player
				player.addAffect('cooldown_tackle', {
					duration: 4,
					deactivate: function () {
						player.say(L(player.getLocale(), 'warrior', 'TACKLE_COOLDOWN_END'));
					}
				});

				return true;
			}
		},
		battlehardened: {
			type: 'passive',
			level: 5,
			name: "Battle Hardened",
			description: "Your experience in battle has made you more hardy. Max health is increased by 200",
			activate: function (player)
			{
				if (player.getAffects('battlehardened')) {
					player.removeAffect('battlehardened');
				}
				player.addAffect('battlehardened', Affects.health_boost({
					magnitude: 200,
					player: player,
					event: 'quit'
				}));
			}
		}
	}
};
