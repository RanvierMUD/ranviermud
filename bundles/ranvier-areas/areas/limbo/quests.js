'use strict';

const FetchGoal = require('../../../ranvier-quests/lib/FetchGoal');
const EquipGoal = require('../../../ranvier-quests/lib/EquipGoal');
const KillGoal = require('../../../ranvier-quests/lib/KillGoal');

module.exports = (srcPath) => {
  const LevelUtil = require(srcPath + 'LevelUtil');
  const Broadcast = require(srcPath + 'Broadcast');
  const say = Broadcast.sayAt;

  return {
    1: {
      config: {
        title: "A Journey Begins",
        level: 1,
        desc: `A voice whispers to you: Welcome to the world, young one. This is a dangerous and deadly place, you should arm yourself.

 - Use '<white>get sword chest</white>' and '<white>get vest chest</white>' to get some gear.
 - Equip it using '<white>wield sword</white>' and '<white>wear vest</white>'`,
        autoComplete: true,
        reward: (quest, player) => {
          player.emit('experience', LevelUtil.mobExp(quest.level) * 5);
          say(player, `<b><cyan>Hint: You can use the '<white>tnl</white>' or '<white>level</white>' commands to see how much experience you need to level.</cyan>`, 80);

          say(player);
          say(
            player,
            `<b><yellow>The rat looks like it is hungry, use '<white>quest list rat</white>' to see what aid you can offer. Use '<white>quest start rat 1</white>' to accept their task.</yellow></b>`,
            80
          );
          say(player);
          say(player, `<b><cyan>Hint: To move around the game type any of the exit names listed in <white>[Exits: ...]</white> when you use the '<white>look</white>' command.</cyan>`, 80);
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
        level: 1,
        desc: `A rat's squeaks seem to indicate it wants some cheese. You check around the area, maybe someone has left some lying around.

Once you find some bring it back to the rat, use '<white>quest log</white>' to find the quest number, then complete the quest with '<white>quest complete #</white>'`,
        repeatable: true,
        reward: (quest, player) => {
          player.emit('experience', LevelUtil.mobExp(quest.level) * 3);
          say(player);
          say(player, `<b><cyan>Hint: NPCs with quests available have <white>[</white><yellow>!</yellow><white>]</white> in front of their name, <white>[</white><yellow>?</yellow><white>]</white> means you have a quest ready to turn in, and <white>[</white><yellow>%</yellow><white>]</white> means you have a quest in progress.</cyan>`, 80);
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
    },

    3: {
      config: {
        title: "Self Defense 101",
        level: 2,
        requires: [ "limbo:1" ],
        autoComplete: true,
        desc: `A voice whispers to you: It would be wise to practice protecting yourself. There are a number of training dummies in this area that, while not pushovers, will not be too difficult.

- Use '<white>attack dummy</white>' to start combat against the training dummy
- Once it's dead any loot it drops will be in its corpse on the ground. You can use '<white>look in corpse</white>' to check again or '<white>get all corpse</white>' to retrieve your loot.`,
        reward: (quest, player) => {
          player.emit('experience', LevelUtil.mobExp(quest.level) * 5);

          say(player, `<b><cyan>Hint: You can get the loot from enemies with '<white>get <item> corpse</white>' but be quick about it, the corpse will decay after some time.</cyan>`, 80);
        }
      },
      goals: [
        {
          type: KillGoal,
          config: { title: "Kill a Training Dummy", npc: "limbo:4", count: 1 }
        }
      ]
    }
  };
};
