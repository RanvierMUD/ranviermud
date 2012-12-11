// wearable.js

exports.listeners = {
    wear: function(I10n) {
        return function(location, player, players) {
            player.sayL10n(l10n, 'WEAR', this.getShortDesc(player.getLocale()));
            player.equip(location, this);
        };
    },
    remove: function(I10n) {
        return function (player)
        {
            player.sayL10n(l10n, 'REMOVE', this.getShortDesc(player.getLocale()));
        };
    }
};