'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    command : state => (args, player) => {
      // match cast "fireball" target
      const match = args.match(/^(['"])([^\1]+)+\1(?:$|\s+(.+)$)/);
      if (!match) {
        return Broadcast.sayAt(player, "Название заклинания должно быть заключено в символы : ' или * или !");
      }

      const [ , , spellName, targetArgs] = match;
      const spell = state.SpellManager.find(spellName);

      if (!spell) {
        return Broadcast.sayAt(player, "И откуда вы набрались таких выражений?");
      }

      player.queueCommand({
        execute: _ => {
          player.emit('useAbility', spell, targetArgs);
        },
        label: `cast ${args}`,
      }, spell.lag || state.Config.get('skillLag') || 1000);
    }
  };
};
