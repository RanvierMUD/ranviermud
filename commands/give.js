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

        args = args.split(' ');
        if (!args.length) {
            player.sayL10n(l10n, 'NO_ITEM_OR_TARGET');
            return;
        }
        var item = CommandUtil.findItemInInventory(args[0], player, true);
        var targetPlayer = args[1];
        var targetFound = false;
        var room = rooms.getAt(player.getLocation());

        if (!item) {
            player.sayL10n(l10n, 'ITEM_NOT_FOUND');
            return;
        }

        if (!targetPlayer) {
            player.sayL10n(l10n, 'NO_ITEM_OR_TARGET');
            return;
        }

        targetPlayer = targetPlayer.toLowerCase();

        players.eachIf(function (p) {
            return otherPlayersInRoom(p);
        }, function (p) {
            if (p.getName().toLowerCase() == targetPlayer) {
                giveItemToPlayer(player, p, item);
                targetFound = true;
            }
        });

        if (!targetFound) {
            player.sayL10n(l10n, "PLAYER_NOT_FOUND");
            return;
        }

        function giveItemToPlayer(playerGiving, playerReceiving, itemGiven) {

            try {
                playerGiving.sayL10n(l10n, 'ITEM_GIVEN', itemGiven.getShortDesc(playerGiving.getLocale()), playerReceiving.getName());
                playerReceiving.sayL10n(l10n, 'ITEM_RECEIVED', itemGiven.getShortDesc(playerReceiving.getLocale()), playerGiving.getName());
            } catch (e) {
                console.log("Error when giving an item ", e);
                playerGiving.sayL10n(l10n, 'GENERIC_ITEM_GIVEN', playerReceiving.getName());
                playerReceiving.sayL10n(l10n, 'GENERIC_ITEM_RECEIVED', playerGiving.getName());
            }

            playerGiving.removeItem(itemGiven);
            itemGiven.setInventory(playerReceiving.getName());
            playerReceiving.addItem(itemGiven);
        }

        function otherPlayersInRoom(p) {
            if (p)
                return (p.getName() !== player.getName() && p.getLocation() === player.getLocation());
        };
    };
};