'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Parser = require(srcPath + 'CommandParser').CommandParser;
  const say = Broadcast.sayAt;

  class QuestCommand {
    static list(state, player, options) {
      if (!options.length) {
        return say(player, "List quests from whom? quest list <npc>");
      }

      const search = options[0];
      const npc = Parser.parseDot(search, player.room.npcs);
      if (!npc) {
        return say(player, `No quest giver [${search}] found.`);
      }

      if (!npc.quests) {
        return say(player, `${npc.name} has no quests.`);
      }

      let availableQuests = npc.quests
        .map(qid => state.QuestFactory.create(state, qid, player))
        .filter(quest => (player.questTracker.canStart(quest) || player.questTracker.isActive(quest.id)))
      ;

      if (!availableQuests.length) {
        return say(player, `${npc.name} has no quests.`);
      }

      for (let i in availableQuests) {
        let quest = availableQuests[i];
        const displayIndex = parseInt(i, 10) + 1;
        if (player.questTracker.canStart(quest)) {
          say(player, `[<b><yellow>!</yellow></b>] - ${displayIndex}. ${quest.config.title}`);
        } else if (player.questTracker.isActive(quest.id)) {
          quest = player.questTracker.get(quest.id);
          const symbol = quest.getProgress().percent >= 100 ? '?' : '%';
          say(player, `[<b><yellow>${symbol}</yellow></b>] - ${displayIndex}. ${quest.config.title}`);
        }
      }
    }

    static start(state, player, options) {
      if (options.length < 2) {
        return say(player, "Start which quest from whom? 'quest start <npc> <number>'");
      }

      let [search, questIndex] = options;
      questIndex = parseInt(questIndex, 10);

      const npc = Parser.parseDot(search, player.room.npcs);
      if (!npc) {
        return say(player, `No quest giver [${search}] found.`);
      }

      if (!npc.quests) {
        return say(player, `${npc.name} has no quests.`);
      }

      if (isNaN(questIndex) || questIndex < 0 || questIndex > npc.quests.length) {
        return say(player, `Invalid quest, use 'quest list ${search}' to see their quests.`);
      }

      let availableQuests = npc.quests
        .map(qid => state.QuestFactory.create(state, qid, player))
        .filter(quest => (player.questTracker.canStart(quest) || player.questTracker.isActive(quest.id)))
      ;

      const targetQuest = availableQuests[questIndex - 1];

      if (player.questTracker.isActive(targetQuest.id)) {
        return say(player, "You've already started that quest. Use 'quest log' to see your active quests.");
      }

      player.questTracker.start(targetQuest);
    }

    static accept(...args) {
      QuestCommand.start(...args);
    }

    static log(state, player, options) {
      const active = [...player.questTracker.activeQuests];
      if (!active.length) {
        return say(player, "You have no active quests.");
      }

      for (let i in active) {
        const [, quest] = active[i];
        const progress = quest.getProgress();
        Broadcast.at(player, '<b><yellow>' + (parseInt(i, 10) + 1) + '</yellow></b>: ');
        say(player, Broadcast.progress(60, progress.percent, 'yellow'));
        say(player, '<b><yellow>' + quest.getProgress().display + '</yellow></b>');
        if (quest.config.npc) {
          const npc = state.MobFactory.getDefinition(quest.config.npc);
          say(player, `Questor: ${npc.name}`);
        }
        say(player, `${quest.config.desc}`, 100);
        say(player, '----');
      }
    }

    static complete(state, player, options)  {
      const active = [...player.questTracker.activeQuests];
      let targetQuest = parseInt(options[0], 10);
      targetQuest = isNaN(targetQuest) ? -1 : targetQuest - 1;
      if (targetQuest < 0 || targetQuest > active.length) {
        return say(player, "Invalid quest, use 'quest log' to see your active quests.");
      }

      const [, quest ] = active[targetQuest];

      if (quest.getProgress().percent < 100) {
        say(player, `${quest.config.title} isn't complete yet.`);
        quest.emit('progress', quest.getProgress());
        return;
      }

      if (quest.config.npc && ![...player.room.npcs].find((npc) => npc.entityReference === quest.config.npc)) {
        const npc = state.MobFactory.getDefinition(quest.config.npc);
        return say(player, `The questor [${npc.name}] is not in this room.`);
      }

      quest.complete();
    }
  }

  return {
    usage: 'quest <log/list/complete/start> [npc] [number]',
    command : (state) => (args, player) => {
      args = args.trim();

      if (!args.length) {
        return say(player, "Missing command. See 'help quest'");
      }

      const [command, ...options] = args.split(' ');

      if (Reflect.has(QuestCommand, command)) {
        return QuestCommand[command](state, player, options);
      }

      say(player, "Invalid command. See 'help quest'");
    }
  };
};
