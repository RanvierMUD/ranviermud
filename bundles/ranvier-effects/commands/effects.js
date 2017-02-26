'use strict';
const humanize = (sec) => { return require('humanize-duration')(sec, { round: true }); };

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Flag = require(srcPath + 'EffectFlag');

  return {
    aliases: [ "affects" ],
    command : (state) => (args, player) => {
      Broadcast.sayAt(player, "Current Effects:");

      const effects = player.effects.entries().filter(effect => {
        return !effect.config.hidden;
      });

      if (!effects.length) {
        return Broadcast.sayAt(player, "  None.");
      }

      for (const effect of effects) {
        let color = 'white';
        if (effect.flags.includes(Flag.BUFF)) {
          color = 'green';
        } else if (effect.flags.includes(Flag.DEBUFF)) {
          color = 'red';
        }
        Broadcast.at(player, `<bold><${color}>  ${effect.name}</${color}></bold>: `);
        if (effect.duration === Infinity) {
          Broadcast.sayAt(player, "Permanent");
        } else {
          Broadcast.sayAt(player, ` ${humanize(effect.remaining)} remaining`);
        }
        Broadcast.sayAt(player, "\t" + effect.description);
      }
    }
  };
};
