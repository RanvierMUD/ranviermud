'use strict';

module.exports = (srcPath, bundlePath) => {
  const B = require(srcPath + 'Broadcast');
  const say = B.sayAt;
  const Parser = require(bundlePath + 'ranvier-lib/lib/CommandParser').CommandParser;
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

      let availableQuests = getAvailableQuests(state, player, npc);

      if (!availableQuests.length) {
        return say(player, `${npc.name} has no quests.`);
      }

      for (let i in availableQuests) {
        let quest = availableQuests[i];
        let qref = quest.entityReference;
        const displayIndex = parseInt(i, 10) + 1;
        if (player.questTracker.canStart(quest)) {
          say(player, `[<b><yellow>!</yellow></b>] - ${displayIndex}. ${quest.config.title}`);
        } else if (player.questTracker.isActive(qref)) {
          quest = player.questTracker.get(qref);
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

      if (!npc.quests || !npc.quests.length) {
        return say(player, `${npc.name} has no quests.`);
      }

      if (isNaN(questIndex) || questIndex < 0 || questIndex > npc.quests.length) {
        return say(player, `Invalid quest, use 'quest list ${search}' to see their quests.`);
      }

      let availableQuests = getAvailableQuests(state, player, npc);

      const targetQuest = availableQuests[questIndex - 1];

      if (player.questTracker.isActive(targetQuest.entityReference)) {
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

        B.at(player, '<b><yellow>' + (parseInt(i, 10) + 1) + '</yellow></b>: ');
        say(player, B.progress(60, progress.percent, 'yellow') + ` ${progress.percent}%`);
        say(player, B.indent('<b><yellow>' + quest.getProgress().display + '</yellow></b>', 2));

        if (quest.config.npc) {
          const npc = state.MobFactory.getDefinition(quest.config.npc);
          say(player, `  <b><yellow>Questor: ${npc.name}</yellow></b>`);
        }

        say(player, '  ' + B.line(78));
        say(
          player,
          B.indent(
            B.wrap(`<b><yellow>${quest.config.description}</yellow></b>`, 78),
            2
          )
        );

        if (quest.config.rewards.length) {
          say(player);
          say(player, '<b><yellow>' + B.center(80, 'Rewards') + '</yellow></b>');
          say(player, '<b><yellow>' + B.center(80, '-------') + '</yellow></b>');

          for (const reward of quest.config.rewards) {
            const rewardClass = state.QuestRewardManager.get(reward.type);
            say(player, '  ' + rewardClass.display(state, quest, reward.config, player));
          }
        }

        say(player, '  ' + B.line(78));
      }
    }
  });

  subcommands.add({
    name: 'complete',
    command: (state) => (options, player) => {
      const active = [...player.questTracker.activeQuests];
      let targetQuest = parseInt(options[0], 10);
      targetQuest = isNaN(targetQuest) ? -1 : targetQuest - 1;
      if (!active[targetQuest]) {
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

function getAvailableQuests(state, player, npc) {
  return npc.quests
    .map(qid => state.QuestFactory.create(state, qid, player))
    .filter(quest => {
        const qref = quest.entityReference;
        return player.questTracker.canStart(quest) || player.questTracker.isActive(qref);
    })
  ;
}
