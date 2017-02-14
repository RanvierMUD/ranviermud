'use strict';

const sprintf = require('sprintf-js').sprintf;
const util = require('util');

module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    aliases: ['abilities', 'spells'],
    command: state => (args, player) => {
      Broadcast.sayAt(player, "<bold><green>                    Abilities</green></bold>");
      Broadcast.sayAt(player, "<bold><green>" + (new Array(50)).join('=') + "</green></bold>");

      for (const [ level, abilities ] of Object.entries(player.playerClass.abilityTable)) {
        abilities.skills = abilities.skills || [];
        abilities.spells = abilities.spells || [];

        if (!abilities.skills.length && !abilities.spells.length) {
          continue;
        }

        Broadcast.sayAt(player, `\r\n<bold>Level ${level}</bold>`);
        Broadcast.sayAt(player, (new Array(50)).join('-'));

        let i = 0;
        if (abilities.skills.length) {
          Broadcast.sayAt(player, '\r\n<bold>Skills</bold>');
        }

        for (let skillId of abilities.skills) {
          let skill = state.SkillManager.get(skillId);

          if (!skill) {
            util.log(`Invalid skill in ability table: ${player.playerClass.name}:${level}:${skillId}`);
            continue;
          }

          let name = sprintf("%-20s", skill.name);
          if (player.level >= level) {
            name = `<green>${name}</green>`;
          }
          Broadcast.at(player, name);

          if (++i % 3 === 0) {
            Broadcast.sayAt(player);
          }
        }

        if (abilities.spells.length) {
          Broadcast.sayAt(player, '\r\n<bold>Spells</bold>');
        }

        for (let spellId of abilities.spells) {
          let spell = state.SpellManager.get(spellId);

          if (!spell) {
            util.log(`Invalid spell in ability table: ${player.playerClass.name}:${level}:${spellId}`);
            continue;
          }

          let name = sprintf("%-20s", spell.name);
          if (player.level >= level) {
            name = `<green>${name}</green>`;
          }
          Broadcast.at(player, name);

          if (++i % 3 === 0) {
            Broadcast.sayAt(player);
          }
        }

        // end with a line break
        Broadcast.sayAt(player);
      }
    }
  };
};
