var l10n_file = __dirname + '/../l10n/commands/target.yml';
var l10n = require('../src/l10n')(l10n_file);
exports.command = function(rooms, items, players, npcs, Commands) {
    return function(args, player) {
        var targets = {
            torso: ['torso', 'chest', 'body', 'arms', 'stomach', 'gut', 'belly'],
            head: ['head', 'face', 'eyes'],
            hands: ['hand'],
            feet: ['foot'],
            legs: ['leg']
        };

        if (args) {
            if (args in targets) {
                setTarget(args);
                return;
            } else {
                for (var targetable in targets) {
                    var found = targets[targetable].reduce(checkTargets, false);
                    if (found) {
                        setTarget(targetable);
                        return;
                    }
                }
            }
        }

        player.sayL10n(l10n, 'NO_TARGET', player.getDescription());
        return;

        function checkTargets(previous, current, index, array) {
            if (!previous) {
                if (current) {
                    if (current === args.toLowerCase()) {
                        return true;
                    } else return false;
                }
            } else return true;
        }

        function setTarget(target) {
            player.setPreference('target', target);
            player.sayL10n(l10n, "TARGET_SET", target);
        }

    }
};
