var l10n_file = __dirname + '/../l10n/commands/give.yml';
var l10n = require('../src/l10n')(l10n_file);
var CommandUtil = require('../src/command_util').CommandUtil;
exports.command = function (rooms, items, players, npcs, Commands) {
    return function (args, player) {
        // syntax 'give [target player] [item]'
        if (player.isInCombat()) {
            player.sayL10n(l10n, 'GIVE_COMBAT');
            return;
        }

        var room = rooms.getAt(player.getLocation());

        args = args.split(' ');
        var item = CommandUtil.findItemInInventory(args[1], player, true);

        if (!item) {
            player.sayL10n(l10n, 'ITEM_NOT_FOUND');
            return;
        }

        var target = players.eachIf(function (p) {
            otherPlayersInRoom(p)
        }, function (p) {
            giveItemToPlayer(player, p, item)
        });

        function giveItemToPlayer(playerGiving, playerReceiving, item) {
            item = items.get(item);

            playerGiving.sayL10n(l10n, 'ITEM_GIVEN', item.getShortDesc(player.getLocale()));
            playerReceiving.sayL10n(l10n, 'ITEM_RECEIVED', item.getShortDesc(player.getLocale()));

            playerGiving.removeItem(item.getUuid());
            item.setInventory(playerReceiving.getName());
            playerReceiving.addItem(item);
        }

        function otherPlayersInRoom(p) {
            if (p)
                return (p.getName() !== player.getName() && p.getLocation() === player.getLocation());
        };
    };
};