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
	mystic: {
		stun: {
			type: 'active',
			level: 2,
			name: "Stun",
			description: "You have the power to mentally incapacitate an opponent for a short period of time by worming into their mind. The psionic attack causes little harm, but fills the enemy with horror, temporarily paralyzing them.",
			cooldown: 4,
			activate: function (player, args, rooms, npcs)
			{
				if (!player.isInCombat()) {
					player.say("You are not fighting anyone.");
					return true;
				}

				if (player.getAffects('cooldown_stun')) {
					player.say("You need to wait before invading your opponent's mind again.");
					return true;
				}
				
				var target = player.isInCombat();
				if (!target) {
					player.say("Somehow you're in combat with a ghost");
					return true;
				}

				var slowed = Math.ceil(player.getAttribute('willpower')/2);

				player.say("Your opponent reels in horror from your psionic attack.");
				target.setAttribute('health', target.getAttribute('health') - 1);

				if (!target.getAffects('slow')) {
					target.addAffect('slow', Affects.slow({
						duration: 6,
						magnitude: slowed,
						player: player,
						target: target,
						deactivate: function () {
							player.say("Your opponent seems to regain their concentration.");
						}
					}));
				}

				// Slap a cooldown on the player
				player.addAffect('cooldown_psionic', {
					duration: 2,
					deactivate: function () {
						player.say("You feel mentally re-charged.");
					}
				});

				return true;
			}
		},
		concentrate: {
			type: 'active',
			level: 5,
			name: "Concentrate",
			description: "Your experience in the mystic arts has improved your ability to block out distractions, allowing you to concentrate your mind and improve your psionic ability.",
			cooldown: 8,
			activate: function (player, args, rooms, npcs)
			{
				var boost = player.getAttribute('willpower'));
				
				// Doesn't stack
				if (player.getAffects('psion_boost')) {
						player.say("You are already concentrating.");
						return true;
					};
				player.say("You focus intently.");
				// Adds effect
				player.addAffect('psion_boost', Affects.psion_boost({
					duration: 8,
					magnitude: boost;
					player: player;
					deactivate: function () {
						player.say("You feel your concentration slipping back to normal.");
						player.removeAffect('psion_boost');
					}
				}));

				return true;
			}
		}
	},
	troublemaker: {
		uncannyspeed: {
			type: 'passive',
			level: 5,
			name: "Uncanny Speed",
			description: "Your experience in combat has increased your reflexes. You feel yourself striking, parrying, and dodging faster than most of your opponents.",
			activate: function (player)
			{
				if (player.getAffects('uncannyspeed')) {
					player.removeAffect('uncannyspeed');
				}
				player.addAffect('uncannyspeed', Affects.speed_boost({
					magnitude: 2,
					player: player,
					event: 'quit'
				}));
			}
		}
	},
	defender: {
		tackle: {
			type: 'active',
			level: 2,
			name: "Tackle",
			description: "Tackle your opponent for 80% weapon damage. Target's attacks are slower for 10 seconds following the attack.",
			cooldown: 8,
			activate: function (player, args, rooms, npcs)
			{
				if (!player.isInCombat()) {
					player.say(L(player.getLocale(), 'defender', 'TACKLE_NOCOMBAT'));
					return true;
				}

				if (player.getAffects('cooldown_tackle')) {
					player.say(L(player.getLocale(), 'defender', 'TACKLE_COOLDOWN'));
					return true;
				}
				
				var target = player.isInCombat();
				if (!target) {
					player.say("Somehow you're in combat with a ghost");
					return true;
				}

				var damage = Math.min(target.getAttribute('max_health'), Math.ceil(player.getDamage().max * .8));

				player.say(L(player.getLocale(), 'defender', 'TACKLE_DAMAGE', damage));
				target.setAttribute('health', target.getAttribute('health') - damage);

				if (!target.getAffects('slow')) {
					target.addAffect('slow', Affects.slow({
						duration: 6,
						magnitude: 2,
						player: player,
						target: target,
						deactivate: function () {
							player.say(L(player.getLocale(), 'defender', 'TACKLE_RECOVER'));
						}
					}));
				}

				// Slap a cooldown on the player
				player.addAffect('cooldown_tackle', {
					duration: 4,
					deactivate: function () {
						player.say(L(player.getLocale(), 'defender', 'TACKLE_COOLDOWN_END'));
					}
				});

				return true;
			}
		},
		battlehardened: {
			type: 'passive',
			level: 5,
			name: "Battle Hardened",
			description: "Your experience in battle has made you more hardy. Max health is increased by 100",
			activate: function (player)
			{
				if (player.getAffects('battlehardened')) {
					player.removeAffect('battlehardened');
				}
				player.addAffect('battlehardened', Affects.health_boost({
					magnitude: 100,
					player: player,
					event: 'quit'
				}));
			}
		}
	}
};
