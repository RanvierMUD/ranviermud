'use strict';
const util  = require('util');


module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Parser = require(srcPath + 'CommandParser').CommandParser;

  class QuestCommand {
    static list(state, player, options) {
      if (!options.length) {
        return Broadcast.sayAt(player, "List quests from whom? quest list <npc>");
      }

      const search = options[0];
      const npc = Parser.parseDot(search, player.room.npcs);
      if (!npc) {
        return Broadcast.sayAt(player, `No quest giver [${search}] found.`);
      }

      if (!npc.quests) {
        return Broadcast.sayAt(player, `${npc.name} has no quests.`);
      }

      let availableQuests = npc.quests
        .map(qid => state.QuestFactory.create(state, qid, {}, player))
        .filter(quest => (player.questTracker.canStart(quest) || player.questTracker.isActive(quest.id)))
      ;

      if (!availableQuests.length) {
        return Broadcast.sayAt(player, `${npc.name} has no quests.`);
      }

      for (let i in availableQuests) {
        let quest = availableQuests[i];
        const displayIndex = parseInt(i, 10) + 1;
        if (player.questTracker.canStart(quest)) {
          Broadcast.sayAt(player, `[<bold><yellow>!</yellow></bold>] - ${displayIndex}. ${quest.config.title}`);
        } else if (player.questTracker.isActive(quest.id)) {
          quest = player.questTracker.get(quest.id);
          const symbol = quest.getProgress().percent >= 100 ? '?' : '%';
          Broadcast.sayAt(player, `[<bold><yellow>${symbol}</yellow></bold>] - ${displayIndex}. ${quest.config.title}`);
        }
      }

      Broadcast.sayAt(player, '');
    }

    static start(state, player, options) {
      if (options.length < 2) {
        return Broadcast.sayAt(player, "Start which quest from whom? 'quest start <npc> <number>'");
      }

      let [search, questIndex] = options;
      questIndex = parseInt(questIndex, 10);

      const npc = Parser.parseDot(search, player.room.npcs);
      if (!npc) {
        return Broadcast.sayAt(player, `No quest giver [${search}] found.`);
      }

      if (!npc.quests) {
        return Broadcast.sayAt(player, `${npc.name} has no quests.`);
      }

      if (isNaN(questIndex) || questIndex < 0 || questIndex > npc.quests.length) {
        return Broadcast.sayAt(player, `Invalid quest, use 'quest list ${search}' to see their quests.`);
      }

      let availableQuests = npc.quests
        .map(qid => state.QuestFactory.create(state, qid, {}, player))
        .filter(quest => (player.questTracker.canStart(quest) || player.questTracker.isActive(quest.id)))
      ;

      const targetQuest = availableQuests[questIndex - 1];

      if (player.questTracker.isActive(targetQuest.id)) {
        return Broadcast.sayAt(player, "You've already started that quest. Use 'quest log' to see your active quests.");
      }

      player.questTracker.start(targetQuest);
    }

    static log(state, player, options) {
      const active = [...player.questTracker.activeQuests];
      if (!active.length) {
        return Broadcast.sayAt(player, "You have no active quests.");
      }

      for (let i in active) {
        const [qid, quest] = active[i];
        Broadcast.sayAt(player, (parseInt(i, 10) + 1) + '. <bold><yellow>' + quest.getProgress().display + '</yellow></bold>');
        if (quest.config.npc) {
          const npc = state.MobFactory.getDefinition(quest.config.npc);
          Broadcast.sayAt(player, `Questor: ${npc.name}`);
        }
        Broadcast.sayAt(player, `${quest.config.desc}`);
        Broadcast.sayAt(player, '----');
      }
    }

    static complete(state, player, options)  {
      const active = [...player.questTracker.activeQuests];
      let targetQuest = parseInt(options[0], 10);
      targetQuest = isNaN(targetQuest) ? -1 : targetQuest - 1;
      if (targetQuest < 0 || targetQuest > active.length) {
        return Broadcast.sayAt(player, "Invalid quest, use 'quest log' to see your active quests.");
      }

      const [ qid, quest ] = active[targetQuest];

      if (quest.getProgress().percent < 100) {
        Broadcast.sayAt(player, `${quest.config.title} isn't complete yet.`);
        quest.emit('progress', quest.getProgress());
        return;
      }

      if (quest.config.npc && ![...player.room.npcs].find((npc) => npc.entityReference === quest.config.npc)) {
        const npc = state.MobFactory.getDefinition(quest.config.npc);
        return Broadcast.sayAt(player, `The questor [${npc.name}] is not in this room.`);
      }

      quest.complete();
    }
  }

  return {
    command : (state) => (args, player) => {
      args = args.trim();

      if (!args.length) {
        return Broadcast.sayAt(player, "Missing command. See 'help quest'");
      }

      const [command, ...options] = args.split(' ');

      if (Reflect.has(QuestCommand, command)) {
        return QuestCommand[command](state, player, options);
      }

      Broadcast.sayAt(player, "Invalid command. See 'help quest'");
    }
  };
};
