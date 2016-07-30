'use strict';

const _ = require('../src/helpers');

exports.command = (rooms, items, players, npcs, Commands) => {
	return (args, player) => {
    args = args.trim().toLowerCase();
    const attrs = ['stamina', 'quickness', 'cleverness', 'willpower'];
    const points = player.getAttribute('attrPoints');

    const noPoints = () => player.say("You must gain more experience before boosting your abilities.");

    const displayBoostables = () => {
      if (points) {
        player.say("You may boost: ");
        attrs.forEach(a => player.say('\t' + a));
      } else { noPoints(); }
    };

    if (!args) {
      displayBoostables();
      return;
    }

    if (_.has(attrs, args)) {
      if (points) {
        player.setAttribute('attrPoints', points - 1);
        player.setAttribute(args, player.getAttribute(args) + 1);
        player.say("<yellow>You boost your " + args + '.</yellow>');
      } else { noPoints(); }
      return;
    }

    player.say("You cannot boost " + args + ".");
    displayBoostables();
    return;

	};
};
