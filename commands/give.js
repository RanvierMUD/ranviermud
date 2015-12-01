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
        var item = CommandUtil.findItemInInventory(args[0], player, true);

        if (!item) {
            player.sayL10n(l10n, 'ITEM_NOT_FOUND');
            return;
        }

        console.log("original item", item);
        console.log("item get", items.get(item));

        var targetPlayer = args[1].toLowerCase();
        players.eachIf(function (p) {
            return otherPlayersInRoom(p);
        }, function (p) {
            if (p.getName().toLowerCase() == targetPlayer) {
                giveItemToPlayer(player, p, item);
            }
        });

        function giveItemToPlayer(playerGiving, playerReceiving, itemGiven) {
        	console.log("player giving ", playerGiving);
        	console.log("player receiving ", playerReceiving);
        	console.log("item ", itemGiven);
            try {
                playerGiving.sayL10n(l10n, 'ITEM_GIVEN', itemGiven.getShortDesc(playerGiving.getLocale()), playerReceiving.getName());
                playerReceiving.sayL10n(l10n, 'ITEM_RECEIVED', itemGiven.getShortDesc(playerReceiving.getLocale()), playerGiving.getName());
            } catch (e) {
            	console.log("ERROR WHEN GIVING AN ITEM --> ", e);
            	playerGiving.sayL10n(l10n, 'GENERIC_ITEM_GIVEN', playerReceiving.getName());
            	playerReceiving.sayL10n(l10n, 'GENERIC_ITEM_RECEIVED', playerGiving.getName());
            }

            playerGiving.removeItem(itemGiven.getUuid());
            itemGiven.setInventory(playerReceiving.getName());
            playerReceiving.addItem(itemGiven);
        }

        function otherPlayersInRoom(p) {
            if (p)
                return (p.getName() !== player.getName() && p.getLocation() === player.getLocation());
        };
    };
};