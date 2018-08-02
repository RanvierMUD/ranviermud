'use strict';

module.exports = (srcPath) => {
  const B = require(srcPath + 'Broadcast');
  const SkillFlag = require(srcPath + 'SkillFlag');

  return {
    aliases: [ "spell" ],
    command : state => (args, player) => {
      const say = (message, wrapWidth) => B.sayAt(player, message, wrapWidth);

      if (!args.length) {
        return say("Какое умение или заклинание вы хотите найти? Используйте команду 'умения', чтобы просмотреть все  ваши умения и заклинания.");
      }

      let skill = state.SkillManager.find(args, true);
      if (!skill) {
        skill = state.SpellManager.find(args, true);
      }

      if (!skill) {
        return say("Нет такого умения.");
      }

      say('<b>' + B.center(80, skill.name, 'white', '-') + '</b>');
      if (skill.flags.includes(SkillFlag.PASSIVE)) {
        say('<b>Пассивные</b>');
      } else {
        say(`<b>Использовать</b>: ${skill.id}`);
      }

      if (skill.resource && skill.resource.cost) {
        say(`<b>Цена</b>: <b>${skill.resource.cost}</b> ${skill.resource.attribute}`);
      }

      if (skill.cooldownLength) {
        say(`<b>Время перезарядки</b>: <b>${skill.cooldownLength}</b> seconds`);
      }
      say(skill.info(player), 80);
      say('<b>' + B.line(80) + '</b>');
    }
  };
};


