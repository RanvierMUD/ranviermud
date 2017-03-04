'use strict';

const leftPad = require('left-pad');

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const CommandParser = require(srcPath + 'CommandParser').CommandParser;
  const Item = require(srcPath + 'Item');
  const ItemType = require(srcPath + 'ItemType');
  const Logger = require(srcPath + 'Logger');

  function getCompass(player) {
    const room = player.room;

    const exitMap = new Map();
    exitMap.set('east', 'E');
    exitMap.set('west', 'W');
    exitMap.set('south', 'S');
    exitMap.set('north', 'N');
    exitMap.set('southwest', 'SW');
    exitMap.set('southeast', 'SE');
    exitMap.set('northwest', 'NW');
    exitMap.set('northeast', 'NE');

    const directionsAvailable = room.exits.map(exit => exitMap.get(exit.direction));

    const exits = Array.from(exitMap.values()).map(exit => {
      if (directionsAvailable.includes(exit)) {
        return exit;
      }
      //If we are either SE or NE, pre-pad
      if (exit.length === 2 && exit.includes('E')) {
        return ' -';
      }

      //If we are either SW or NW, post-pad
      if (exit.length === 2 && exit.includes('W')) {
        return '- ';
      }
      return '-';
    });

    const [E, W, S, N, SW, SE, NW, NE] = exits;

    const line1 = `<yellow><bold>${NW}</bold></yellow>     <yellow><bold>${N}</bold></yellow>     <yellow><bold>${NE}</bold></yellow>`;
    const line2 = `<yellow><bold>${W}</bold></yellow> <---(M)---> <yellow><bold>${E}</bold></yellow>`;
    const line3 = `<yellow><bold>${SW}</bold></yellow>     <yellow><bold>${S}</bold></yellow>     <yellow><bold>${SE}</bold></yellow>\r\n`;

    return [line1, line2, line3];
  }

  function lookRoom(state, player) {
    const room = player.room;

    const [ line1, line2, line3 ] = getCompass(player);

    // Render the room

    //The top line has 99 characters of ANSI coloring (114(COLORS) - 2(NW) - 1(N) - 2(NE) - 5(SPACING) - 5(SPACING))
    //The 164 accounts for this
    Broadcast.sayAt(player, `<yellow><bold>${room.title}</bold></yellow>` + leftPad(line1, 164 - room.title.length));
    Broadcast.sayAt(player, '--------------------------------------------' + leftPad(line2, 90));
    Broadcast.sayAt(player, leftPad(line3, 166));

    if (!player.getMeta('config.brief')) {
      Broadcast.sayAt(player, room.description, 80);
    }

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
        const quests = npc.quests.map(qid => state.QuestFactory.create(state, qid, player));
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
  }

  function lookEntity(player, args) {
    const room = player.room;

    args = args.split(' ');
    let search = null;

    if (args.length > 1) {
      search = args[0] === 'in' ? args[1] : args[0];
    } else {
      search = args[0];
    }

    let entity = CommandParser.parseDot(search, room.items);
    entity = entity || CommandParser.parseDot(search, room.players);
    entity = entity || CommandParser.parseDot(search, room.npcs);
    entity = entity || CommandParser.parseDot(search, player.inventory);

    if (!entity) {
      return Broadcast.sayAt(player, "You don't see anything like that here.");
    }

    if (entity instanceof player.constructor) {
      // TODO: Show player equipment
      Broadcast.sayAt(player, `You see fellow player ${entity.name}.`);
      return;
    }

    Broadcast.sayAt(player, entity.description);

    if (entity instanceof Item && entity.type === ItemType.CONTAINER) {
      if (!entity.inventory || !entity.inventory.size) {
        return Broadcast.sayAt(player, `${entity.name} is empty.`);
      }

      Broadcast.sayAt(player, "Contents:");

      for (const [, item ] of entity.inventory) {
        Broadcast.sayAt(player, "  " + item.name);
      }
    }
  }

  return {
    usage: "look [thing]",
    command: state => (args, player) => {
      if (!player.room) {
        Logger.error(player.getName() + ' is in limbo.');
        return Broadcast.sayAt(player, 'You are in a deep, dark void.');
      }

      if (args) {
        return lookEntity(player, args);
      }

      lookRoom(state, player);
    }
  };
};
