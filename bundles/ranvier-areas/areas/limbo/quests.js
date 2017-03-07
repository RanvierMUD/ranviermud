'use strict';

const FetchGoal = require('../../../ranvier-quests/lib/FetchGoal');
const EquipGoal = require('../../../ranvier-quests/lib/EquipGoal');

module.exports = (srcPath) => {
  const LevelUtil = require(srcPath + 'LevelUtil');
  const Broadcast = require(srcPath + 'Broadcast');
  const say = Broadcast.sayAt;

  return {
    1: {
      config: {
        title: "A Journey Begins",
        desc: `A voice whispers to you: Welcome to the world, young one. This is a dangerous and deadly place, you should arm yourself.
 - Use '<white>get sword chest</white>' and '<white>get vest chest</white>' to get some gear.
 - Equip it using '<white>wield sword</white>' and '<white>wear vest</white>'`,
        autoComplete: true,
        reward: (quest, player) => {
          player.emit('experience', LevelUtil.mobExp(player.level) * 5);
          say(player, `<b><cyan>Hint: You can use the '<white>tnl</white>' or '<white>level</white>' commands to see how much experience you need to level.</cyan>`);

          say(player);
          say(
            player,
            `<b><yellow>The rat looks like it is hungry, use '<white>quest list rat</white>' to see what aid you can offer. Use '<white>quest start rat 1</white>' to accept their task.</yellow></b>`,
            100
          );
          say(player, `<b><cyan>Hint: NPCs with quests available have <white>[</white><yellow>!</yellow><white>]</white><cyan> in front of their name.</cyan>`);
        }
      },
      goals: [
        {
          type: FetchGoal,
          config: { title: 'Find A Weapon', count: 1, item: "limbo:1" }
        },
        {
          type: FetchGoal,
          config: { title: 'Find Some Armor', count: 1, item: "limbo:6" }
        },
        {
          type: EquipGoal,
          config: { title: 'Wield A Weapon', slot: 'wield' }
        },
        {
          type: EquipGoal,
          config: { title: 'Equip Some Armor', slot: 'chest' }
        }
      ]
    },

    2: {
      config: {
        title: "One Cheese Please",
        desc: `A rat's squeaks seem to indicate it wants some cheese. You should look around the area, maybe someone has left some lying around.

Once you find some bring it back to the rat use '<white>quest log</white>' to find the quest number. Then complete the quest with '<white>quest complete #</white>'`,
        repeatable: true,
        reward: (quest, player) => {
          player.emit('experience', LevelUtil.mobExp(player.level) * 3);
        }
      },
      goals: [
        {
          type: FetchGoal,
          config: {
            title: 'Found Cheese',
            count: 1,
            item: "limbo:2",
            removeItem: true,
          }
        }
      ]
    }
  };
};
