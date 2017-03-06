'use strict';

module.exports = (srcPath) => {
  const B = require(srcPath + 'Broadcast');

  return {
    aliases: [ 'stats' ],
    command : (state) => (args, player) => {
      const say = message => B.sayAt(player, message);

      const width = 80;
      say('<b>' + B.center(width, player.name, 'green'));
      say('<b>' + B.line(width, '-', 'green'));
      for (const [ name ] of player.attributes) {
       say(`  ${name}: ${player.getAttribute(name)}/${player.getBaseAttribute(name)}`);
      }
    }
  };
};
