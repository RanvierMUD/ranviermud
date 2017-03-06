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

      B.at(p, sprintf(' %-9s: %12s', 'Health', `${stats.health.current}/${stats.health.max}`));
      say('<b><green>' + sprintf(
        '%36s',
        'Weapon '
      ));
      B.at(p, sprintf(' %-9s: %12s', 'Energy', `${stats.energy.current}/${stats.energy.max}`));
      say(sprintf('%35s', '.' + B.line(22)) + '.');

      B.at(p, sprintf('%37s', '|'));
      const weaponDamage = p.getWeaponDamage();
      const min = p.normalizeWeaponDamage(weaponDamage.min);
      const max = p.normalizeWeaponDamage(weaponDamage.max);
      say(sprintf(' %6s:<b>%5s</b> - <b>%-5s</b> |', 'Damage', min, max));
      B.at(p, sprintf('%37s', '|'));
      say(sprintf(' %6s:<b>%12s</b> |', 'Speed', B.center(12, p.getWeaponSpeed() + ' sec')));

      say(sprintf('%60s', "'" + B.line(22) + "'"));

      say('<b><green>' + sprintf(
        '%-24s',
        ' Stats'
      ) + '</green></b>');
      say('.' + B.line(22) + '.');


      const printStat = (stat, newline = true) => {
        const val = stats[stat];
        const statColor = (val.current > val.base ? 'green' : 'white');
        const str = sprintf(
          `| %-9s : <b><${statColor}>%8s</${statColor}></b> |`,
          stat[0].toUpperCase() + stat.slice(1),
          val.current
        );

        if (newline) {
          say(str);
        } else {
          B.at(p, str);
        }
      };

      printStat('strength', false); // left
      say('<b><green>' + sprintf('%36s', 'Gold ')); // right
      printStat('agility', false); // left
      say(sprintf('%36s', '.' + B.line(12) + '.')); // right
      printStat('intellect', false); // left
      say(sprintf('%22s| <b>%10s</b> |', '', p.getMeta('currencies.gold') || 0)); // right
      printStat('stamina', false); // left
      say(sprintf('%36s', "'" + B.line(12) + "'")); // right

      say(':' + B.line(22) + ':');
      printStat('armor');
      say("'" + B.line(22) + "'");
    }
  };
};
