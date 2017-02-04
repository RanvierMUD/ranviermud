'use strict';
const util  = require('util');

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const CommandParser = require(srcPath + 'CommandParser').CommandParser;

  function lookRoom(state, player) {
    const room = player.room;

    // Render the room
    Broadcast.sayAt(player, room.title);
    Broadcast.sayAt(player, room.description, 80);
    Broadcast.sayAt(player, '');

    // show all players
    room.players.forEach(otherPlayer => {
      if (otherPlayer === player) {
        return;
      }

      Broadcast.sayAt(player, '[Player] ' + otherPlayer.name);
    });

    // show all the items in the rom
    room.items.forEach(item => {
      Broadcast.sayAt(player, `<magenta>[Item] ${item.roomDesc}</magenta>`);
    });

    room.npcs.forEach(npc => {
      // show quest state as [!], [%], [?] for available, in progress, ready to complete respectively
      let hasNewQuest, hasActiveQuest, hasReadyQuest;
      if (npc.quests) {
        const quests = npc.quests.map(qid => state.QuestFactory.create(state, qid, {}, player));
        hasNewQuest = quests.find(quest => player.questTracker.canStart(quest));
        hasReadyQuest = quests.find(quest => {
          return player.questTracker.isActive(quest.id) && player.questTracker.get(quest.id).getProgress().percent >= 100;
        });
        hasActiveQuest = quests.find(quest => {
          return player.questTracker.isActive(quest.id) && player.questTracker.get(quest.id).getProgress().percent < 100;
        });

        let questString = '';
        if (hasNewQuest || hasActiveQuest || hasReadyQuest) {
          questString += hasNewQuest ? '[<bold><yellow>!</yellow></bold>]' : '';
          questString += hasActiveQuest ? '[<bold><yellow>%</yellow></bold>]' : '';
          questString += hasReadyQuest ? '[<bold><yellow>?</yellow></bold>]' : '';
          Broadcast.at(player, questString + ' ');
        }
      }
      Broadcast.sayAt(player, '[NPC] ' + npc.name);
    });

    Broadcast.at(player, '[<yellow><bold>Exits</yellow></bold>: ');
      Broadcast.at(player, Array.from(room.exits).map(ex => ex.direction).join(' '));
      Broadcast.sayAt(player, ']');
      Broadcast.sayAt(player, '');
  }

  function lookEntity(player, args) {
    const room = player.room;

    let entity = CommandParser.parseDot(args, room.items);
    entity = entity || CommandParser.parseDot(args, room.players);
    entity = entity || CommandParser.parseDot(args, room.npcs);
    entity = entity || CommandParser.parseDot(args, player.inventory);

    if (!entity) {
      return Broadcast.sayAt(player, "You don't see anything like that here.");
    }

    if (entity instanceof player.constructor) {
      // TODO: Show player equipment
      Broadcast.sayAt(player, `You see fellow player ${entity.name}.`);
      return;
    }

    Broadcast.sayAt(player, entity.description);
  }

  return {
    command: state => (args, player) => {
      if (!player.room) {
        util.log(player.getName() + ' is in limbo.');
        return Broadcast.sayAt(player, 'You are in a deep, dark void.');
      }

      if (args) {
        return lookEntity(player, args);
      }

      lookRoom(state, player);
    }
  };
};
