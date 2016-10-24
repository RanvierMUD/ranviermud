const Broadcast = require('../../../src/broadcast').Broadcast;
const ItemUtil  = require('../../../src/item_util').ItemUtil;


exports.listeners = {
  // TODO: Extract to file so that this functionality can be used for other items, and with special bonuses as well?
  // OR just add a bonus emitter -- might be too spaghetti though.

  wear: function (l10n) {
    return function (location, room, player, players) {
      const missedPrerequisites = this.checkPrerequisites(player);

      if (missedPrerequisites.length) {
        ItemUtil.useDefaultPenalties(this, player, location, missedPrerequisites, 'wear');
      }

      const toRoom = Broadcast.toRoom(room, player, null, players);
      const desc = this.getShortDesc('en');
      const name = player.getName();
      toRoom({
        firstPartyMessage: 'You wear the ' + desc + '.',
        thirdPartyMessage: name + ' wears the ' + desc + '.'
      });
    };
  },

  remove: function (l10n) {
    return function (location, room, player, players) {
      const toRoom = Broadcast.toRoom(room, player, null, players);
      const desc = this.getShortDesc('en');
      const name = player.getName();
      toRoom({
        firstPartyMessage: 'You remove the ' + desc + '.',
        thirdPartyMessage: name + ' removes the ' + desc + '.'
      });

      ItemUtil.removeDefaultPenaltes(player, this, location);

    };
  }
};
