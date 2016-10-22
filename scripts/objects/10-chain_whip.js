const Random = require('../../src/random').Random;
const Broadcast = require('../../src/broadcast').Broadcast;
const ItemUtil  = require('../../src/item_util').ItemUtil;

const util = require('util');

exports.listeners = {

  wield: function (l10n) {
    return function (location, room, player, players) {
      const toRoom = Broadcast.toRoom(room, player, null, players);

      const firstPartyMessage = '<blue>You grip the chain tight in your hand, slinging it over your shoulder.</blue>';
      const thirdPartyMessage = '<blue>' + player.getShortDesc('en') + ' grips a long heavy chain, and slings it over their shoulder.</blue>'
      toRoom({ firstPartyMessage, thirdPartyMessage });

      const missedPrerequisites = this.checkPrerequisites(player);

      missedPrerequisites.forEach(prereq => {
        switch (prereq) {
          case 'stamina':
            return ItemUtil.penalize(player, item, 'stamina', factor => {
              const name = ItemUtil.getPenaltyDesc(item, location, 'encumbered');
              player.warn('You can barely hold the chain, much less swing it properly...');

              player.addEffect(name , Effects.encumbered({ player, factor }));
              player.combat.addSpeedMod({ name, effect: speed => speed / factor });
              player.combat.addToHitMod({ name, effect: toHit => toHit * factor });
              player.combat.addDodgeMod({ name, effect: dodge => dodge * factor });
            });
        }
      });

      if (!missedPrerequisites.length) {
        player.warn('You could sow destruction with this.')
        const bonus = Math.round(player.getAttribute('stamina') / 2);
        player.combat.addDamageMod({
          name: 'chain_whip ' + this.getUuid(),
          effect: damage => damage + bonus
        });
      }

    }
  },

};
