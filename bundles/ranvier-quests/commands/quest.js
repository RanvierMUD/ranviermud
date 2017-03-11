'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const say = Broadcast.sayAt;
  const Parser = require(srcPath + 'CommandParser').CommandParser;
  const CommandManager = require(srcPath + 'CommandManager');

  const subcommands = new CommandManager();
  subcommands.add({
    name: 'list',
    command: state => (options, player) => {
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
  });

  subcommands.add({
    name: 'start',
    aliases: [ 'accept' ],
    command: state => (options, player) => {
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
      player.save();
    }
  });

  subcommands.add({
    name: 'log',
    command: state => (options, player) => {
      const active = [...player.questTracker.activeQuests];
      if (!active.length) {
        return say(player, "You have no active quests.");
      }

      for (let i in active) {
        const [, quest] = active[i];
        const progress = quest.getProgress();

        Broadcast.at(player, '<b><yellow>' + (parseInt(i, 10) + 1) + '</yellow></b>: ');
        say(player, Broadcast.progress(60, progress.percent, 'yellow') + ` ${progress.percent}%`);
        say(player, Broadcast.indent('<b><yellow>' + quest.getProgress().display + '</yellow></b>', 2));

        if (quest.config.npc) {
          const npc = state.MobFactory.getDefinition(quest.config.npc);
          say(player, `  <b><yellow>Questor: ${npc.name}</yellow></b>`);
        }

        say(player, '  ' + Broadcast.line(78));
        say(
          player,
          Broadcast.indent(
            Broadcast.wrap(`<b><yellow>${quest.config.desc}</yellow></b>`, 78),
            2
          )
        );
        say(player, '  ' + Broadcast.line(78));
      }
    }
  });

  subcommands.add({
    name: 'complete',
    command: (state) => (options, player) => {
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
      player.save();
    }
  });

  return {
    usage: 'quest <log/list/complete/start> [npc] [number]',
    command : (state) => (args, player) => {
      if (!args.length) {
        return say(player, "Missing command. See 'help quest'");
      }

      const [ command, ...options ] = args.split(' ');

      const subcommand = subcommands.find(command);
      if (!subcommand) {
        return say(player, "Invalid command. See 'help quest'");
      }

      subcommand.command(state)(options, player);
    }
  };
};
