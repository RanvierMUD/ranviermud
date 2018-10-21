'use strict';

const { Broadcast } = require('ranvier');

module.exports = {
  command : state => (args, player) => {
    // match cast "fireball" target
    const match = args.match(/^(['"])([^\1]+)+\1(?:$|\s+(.+)$)/);
    if (!match) {
      return Broadcast.sayAt(player, "Casting spells must be surrounded in quotes e.g., cast 'fireball' target");
    }

    const [ , , spellName, targetArgs] = match;
    const spell = state.SpellManager.find(spellName);

    if (!spell) {
      return Broadcast.sayAt(player, "No such spell.");
    }

    player.queueCommand({
      execute: _ => {
        player.emit('useAbility', spell, targetArgs);
      },
      label: `cast ${args}`,
    }, spell.lag || state.Config.get('skillLag') || 1000);
  }
};
