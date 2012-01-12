exports.listeners = {
	combat: function (l10n)
	{
		return function (player, room, players, npcs, callback)
		{
			initiate_combat(l10n, this, player, room, npcs, callback);
		}
	}
};

function initiate_combat (l10n, npc, player, room, npcs, callback)
{
	player.setInCombat(true);
	npc.setInCombat(true);

	player.sayL10n(l10n, 'ATTACK', npc.getShortDesc(player.getLocale()));

	var timer = setInterval(function ()
	{
		
		var npc_damage     = Math.max(0, Math.floor(Math.random() * 10)),
		    player_damage  = Math.max(0, Math.floor(Math.random() * 10)),
		    npc_health     = npc.getAttribute('health'),
		    player_health  = player.getAttribute('health');

		npc_damage    = Math.min(player_health, npc_damage);
		player_damage = Math.min(npc_health, player_damage);

		var weapon = player.getEquipped('wield', true);

		if (!player_damage) {
			if (weapon) {
				weapon.emit('miss', player);
			}
			player.sayL10n(l10n, 'PLAYER_MISS', npc.getShortDesc(player.getLocale()), player_damage)
		} else {
			if (weapon) {
				weapon.emit('hit', player);
			}
			player.sayL10n(l10n, 'DAMAGE_DONE', npc.getShortDesc(player.getLocale()), player_damage)
		}
		npc.setAttribute('health', npc_health - player_damage);
		if (npc_health <= player_damage) {
			return combat_end(true, timer);
		}

		if (!npc_damage) {
			if (weapon) {
				weapon.emit('parry', player);
			}
			player.sayL10n(l10n, 'NPC_MISS', npc.getShortDesc(player.getLocale()), npc_damage)
		} else {
			player.sayL10n(l10n, 'DAMAGE_TAKEN', npc.getShortDesc(player.getLocale()), npc_damage)
		}

		player.setAttribute('health', player_health - npc_damage);
		if (player_health <= npc_damage) {
			player.setAttribute('health', 1);
			return combat_end(false, timer);
		}
		player.prompt();
	}, 1000);

	function combat_end (success, timer) {
		player.setInCombat(false);
		npc.setInCombat(false);
		if (success) {
			player.emit('regen');
			room.removeNpc(npc.getUuid());
			npcs.destroy(npc);
			player.sayL10n(l10n, 'WIN', npc.getShortDesc(player.getLocale()));
		} else {
			player.sayL10n(l10n, 'LOSE', npc.getShortDesc(player.getLocale()));
			player.die();
			npc.setAttribute('health', npc.getAttribute('max_health'));
		}
		clearInterval(timer);
		player.prompt();
		callback(success);
	}
}

