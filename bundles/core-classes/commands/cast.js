'use strict';
const util  = require('util');

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    command : state => (args, player) => {
      // match cast "fireball" target
      const match = args.match(/^(['"])([^\1]+)+\1(?:$|\s+(.+)$)/);
      if (!match) {
        return Broadcast.sayAt(player, "Casting spells must be surrounded in quotes e.g., cast 'fireball' target");
      }

      const [,, spellName, targetArgs] = match;
      const spell = state.SpellManager.find(spellName);

      if (!spell) {
        return Broadcast.sayAt(player, "No such spell.");
      }

      spell.execute(targetArgs || "", player);
    }
  };
};
