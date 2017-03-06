'use strict';

const sprintf = require('sprintf-js').sprintf;

module.exports = (srcPath) => {
  const B = require(srcPath + 'Broadcast');

  return {
    aliases: [ 'stats' ],
    command : (state) => (args, p) => {
      const say = message => B.sayAt(p, message);

      say('<b>' + B.center(60, `${p.name}, level ${p.level} ${p.playerClass.config.name}`, 'green'));
      say('<b>' + B.line(60, '-', 'green'));

      let stats = {
        strength: 0,
        agility: 0,
        intellect: 0,
        stamina: 0,
        armor: 0,
        energy: 0,
        health: 0
      };

      for (const stat in stats) {
        stats[stat] = {
          current: p.getAttribute(stat),
          base: p.getBaseAttribute(stat),
          max: p.getMaxAttribute(stat),
        };
      }

      B.at(p, sprintf(' %-6s: %12s', 'Health', `${stats.health.current}/${stats.health.max}`));
      say('<b><green>' + sprintf(
        '%37s',
        'Weapon '
      ));
      B.at(p, sprintf(' %-6s: %12s', 'Energy', `${stats.energy.current}/${stats.energy.max}`));
      say(sprintf('%37s', '.' + B.line(24)) + '.');

      B.at(p, sprintf('%35s', '|'));
      const weaponDamage = p.getWeaponDamage();
      const min = p.normalizeWeaponDamage(weaponDamage.min);
      const max = p.normalizeWeaponDamage(weaponDamage.max);
      say(sprintf(' %6s:  <b>%4s</b> - <b>%-4s</b>  |', 'Damage', min, max));

      B.at(p, '<b><green>' + sprintf(
        '%-24s',
        ' Stats'
      ) + '</green></b>');
      say(sprintf('%35s', "'" + B.line(24) + "'"));

      say('.' + B.line(24) + '.');

      const printStat = stat => {
        const val = stats[stat];
        const statColor = (val.current > val.base ? 'green' : 'white');
        say(sprintf(
          `| %-9s : <b><${statColor}>%9s</${statColor}></b> |`,
          stat[0].toUpperCase() + stat.slice(1),
          val.current
        ));
      };

      for (const stat of ['strength', 'agility', 'intellect', 'stamina']) {
        printStat(stat);
      }

      say(':' + B.line(24) + ':');
      printStat('armor');
      say("'" + B.line(24) + "'");
    }
  };
};
