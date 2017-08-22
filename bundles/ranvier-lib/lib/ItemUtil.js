'use strict';

/**
 * General functions used across the ranvier bundles
 */

const srcPath = '../../../src/'

const sprintf = require('sprintf-js').sprintf;
const ItemType = require(srcPath + 'ItemType');
const B = require(srcPath + 'Broadcast');

/**
 * Render a pretty display of an item
 * @param {GameState} state
 * @param {Item}      item
 * @param {Player}    player
 */
exports.renderItem = function renderItem(state, item, player) {
  let buf = item.qualityColorize('.' + B.line(38) + '.') + '\r\n';
  buf += '| ' + item.qualityColorize(sprintf('%-36s', item.name)) + ' |\r\n';

  const props = item.properties;

  buf += sprintf('| %-36s |\r\n', item.type === ItemType.ARMOR ? 'Armor' : 'Weapon');

  switch (item.type) {
    case ItemType.WEAPON:
      buf += sprintf('| %-18s%18s |\r\n', `${props.minDamage} - ${props.maxDamage} Damage`, `Speed ${props.speed}`);
      const dps = ((props.minDamage + props.maxDamage) / 2) / props.speed;
      buf += sprintf('| %-36s |\r\n', `(${dps.toPrecision(2)} damage per second)`);
      break;
    case ItemType.ARMOR:
      buf += sprintf('| %-36s |\r\n', item.slot[0].toUpperCase() + item.slot.slice(1));
      break;
    case ItemType.CONTAINER:
      buf += sprintf('| %-36s |\r\n', `Holds ${item.maxItems} items`);
      break;
  }

  // copy stats to make sure we don't accidentally modify it
  const stats = Object.assign({}, props.stats);

  // always show armor first
  if (stats.armor) {
    buf += sprintf('| %-36s |\r\n', `${stats.armor} Armor`);
    delete stats.armor;
  }

  // non-armor stats
  for (const stat in stats) {
    const value = stats[stat];
    buf += sprintf(
      '| %-36s |\r\n',
      (value > 0 ? '+' : '') + value + ' ' + stat[0].toUpperCase() + stat.slice(1)
    );
  }

  // custom special effect rendering
  if (props.specialEffects) {
    props.specialEffects.forEach(effectText => {
      const text = B.wrap(effectText, 36).split(/\r\n/g);
      text.forEach(textLine => {
        buf += sprintf('| <b><green>%-36s</green></b> |\r\n', textLine);
      });
    });
  }

  const cantUse = item.level > player.level ? '<red>%-36s</red>' : '%-36s';
  buf += sprintf(`| ${cantUse} |\r\n`, 'Requires Level ' + item.level);
  buf += item.qualityColorize("'" + B.line(38) + "'") + '\r\n';

  // On use
  const usable = item.getBehavior('usable');
  if (usable) {
    if (usable.spell) {
      const useSpell = state.SpellManager.get(usable.spell);
      if (useSpell) {
        useSpell.options = usable.options;
        buf += B.wrap('<b>On Use</b>: ' + useSpell.info(player), 80) + '\r\n';
      }
    }

    if (usable.effect && usable.config.description) {
      buf += B.wrap('<b>Effect</b>: ' + usable.config.description, 80) + '\r\n';
    }

    if (usable.charges) {
      buf += B.wrap(`${usable.charges} Charges`, 80) + '\r\n';
    }
  }

  // colorize border according to item quality
  buf = buf.replace(/\|/g, item.qualityColorize('|'));
  return buf;
};
