'use strict';

/**
 * Command for items with `usable` behavior. See bundles/ranvier-areas/areas/limbo/items.yml for
 * example behavior implementation
 */
module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Logger = require(srcPath + 'Logger');
  const { CommandParser } = require(srcPath + 'CommandParser');

  return {
    aliases: [ 'quaff', 'recite' ],
    command: state => (args, player) => {
      const say = message => Broadcast.sayAt(player, message);

      if (!args.length) {
        return say("Use what?");
      }

      const item = CommandParser.parseDot(args, player.inventory);

      if (!item) {
        return say("You don't have anything like that.");
      }

      const usable = item.getBehavior('usable');
      if (!usable) {
        return say("You can't use that.");
      }

      if ('charges' in usable && usable.charges <= 0) {
        return say(`You've used up all the magic in ${item.display}.`);
      }

      if (usable.spell) {
        const useSpell = state.SpellManager.get(usable.spell);

        if (!useSpell) {
          Logger.error(`Item: ${item.entityReference} has invalid usable configuration.`);
          return say("You can't use that.");
        }

        useSpell.options = usable.options;
        if (usable.cooldown) {
          useSpell.cooldownLength = usable.cooldown;
        }

        if (!useSpell.execute(/* args */ null, player)) {
          // no need to broadcast here, Skill already broadcasts the error
          return;
        }
      }

      if (usable.effect) {
        const effectConfig = Object.assign({
          name: item.name
        }, usable.config || {});
        const effectState = usable.state || {};

        let useEffect = state.EffectFactory.create(usable.effect, player, effectConfig, effectState);
        if (!useEffect) {
          Logger.error(`Item: ${item.entityReference} has invalid usable configuration.`);
          return say("You can't use that.");
        }

        if (!player.addEffect(useEffect)) {
          return say("Nothing happens.");
        }
      }

      if (!('charges' in usable)) {
        return;
      }

      usable.charges--;

      if (usable.destroyOnDepleted && usable.charges <= 0) {
        say(`You used up all the magic in ${item.display} and it disappears in a puff of smoke.`);
        state.ItemManager.remove(item);
      }
    }
  };
};
