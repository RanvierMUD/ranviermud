var l10n_file = __dirname + '/../l10n/commands/target.yml';
var l10n = require('../src/l10n')(l10n_file);
exports.command = function(rooms, items, players, npcs, Commands) {
    return function(args, player) {

        var wimpy = parseInt(args);

        if (wimpy && wimpy > 0 && wimpy < 100){
            player.setPreference('wimpy', wimpy);
            player.sayL10n(l10n, 'WIMPY_SET');
            return;
        }

        player.sayL10n(l10n, 'NO_WIMPY');
        return;
    }
};
