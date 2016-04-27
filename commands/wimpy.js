'use strict';
const l10n_file = __dirname + '/../l10n/commands/wimpy.yml';
const l10n = require('../src/l10n')(l10n_file);

exports.command = (rooms, items, players, npcs, Commands) => {
    return (args, player) => {

        const wimpy = parseInt(args, 10);
        const validWimpiness = wimpy && wimpy > 0 && wimpy < 100;

        if (validWimpiness) {
            player.setPreference('wimpy', wimpy);
            player.sayL10n(l10n, 'WIMPY_SET', wimpy);
            return;
        }

        player.sayL10n(l10n, 'WIMPY', player.getPreference('wimpy'));
        return;
    }
};
