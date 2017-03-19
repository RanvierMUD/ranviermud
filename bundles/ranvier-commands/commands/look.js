'use strict';

const leftPad = require('left-pad');
const humanize = (sec) => { return require('humanize-duration')(sec, { round: true }); };
const sprintf = require('sprintf-js').sprintf;

module.exports = (srcPath, bundlePath) => {
  const B = require(srcPath + 'Broadcast');
  const CommandParser = require(srcPath + 'CommandParser').CommandParser;
  const Item = require(srcPath + 'Item');
  const ItemType = require(srcPath + 'ItemType');
  const Logger = require(srcPath + 'Logger');
  const Player = require(srcPath + 'Player');
  const { renderItem } = require(bundlePath + 'ranvier-lib/lib/ItemUtil');

  return {
    usage: "look [thing]",
    command: state => (args, player) => {
      if (!player.room) {
        Logger.error(player.getName() + ' is in limbo.');
        return B.sayAt(player, 'You are in a deep, dark void.');
      }

      if (args) {
        return lookEntity(state, player, args);
      }

      lookRoom(state, player);
    }
  };

  function getCompass(player) {
    const room = player.room;

    const exitMap = new Map();
    exitMap.set('east', 'E');
    exitMap.set('west', 'W');
    exitMap.set('south', 'S');
    exitMap.set('north', 'N');
    exitMap.set('up', 'U');
    exitMap.set('down', 'D');
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

    let [E, W, S, N, U, D, SW, SE, NW, NE] = exits;
    U = U === 'U' ? '<yellow><b>U</yellow></b>' : U;
    D = D === 'D' ? '<yellow><b>D</yellow></b>' : D;

    const line1 = `${NW}     ${N}     ${NE}`;
    const line2 = `<yellow><b>${W}</b></yellow> <-${U}-(@)-${D}-> <yellow><b>${E}</b></yellow>`;
    const line3 = `${SW}     ${S}     ${SE}\r\n`;

    return [line1, line2, line3];
  }

  function lookRoom(state, player) {
    const room = player.room;

    const [ line1, line2, line3 ] = getCompass(player);

    // map is 15 characters wide, room is formatted to 80 character width
    B.sayAt(player, '<yellow><b>' + sprintf('%-65s', room.title) + line1 + '</b></yellow>');
    B.sayAt(player, B.line(60) + B.line(5, ' ') + line2);
    B.sayAt(player, B.line(65, ' ') + '<yellow><b>' + line3 + '</b></yellow>');

    if (!player.getMeta('config.brief')) {
      B.sayAt(player, room.description, 80);
    }

    B.sayAt(player, '');

    // show all players
    room.players.forEach(otherPlayer => {
      if (otherPlayer === player) {
        return;
      }
      let combatantsDisplay = '';
      if (otherPlayer.isInCombat()) {
        combatantsDisplay = getCombatantsDisplay(otherPlayer);
      }
      B.sayAt(player, '[Player] ' + otherPlayer.name + combatantsDisplay);
    });

    // show all the items in the rom
    room.items.forEach(item => {
      if (item.hasBehavior('resource')) {
        B.sayAt(player, `[Resource] <magenta>${item.roomDesc}</magenta>`);
      } else {
        B.sayAt(player, `[${item.qualityColorize('Item')}] <magenta>${item.roomDesc}</magenta>`);
      }
    });

    // show all npcs
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
          questString += hasNewQuest ? '[<b><yellow>!</yellow></b>]' : '';
          questString += hasActiveQuest ? '[<b><yellow>%</yellow></b>]' : '';
          questString += hasReadyQuest ? '[<b><yellow>?</yellow></b>]' : '';
          B.at(player, questString + ' ');
        }
      }

      let combatantsDisplay = '';
      if (npc.isInCombat()) {
        combatantsDisplay = getCombatantsDisplay(npc);
      }

      // color NPC label by difficulty
      let npcLabel = 'NPC';
      switch (true) {
        case (player.level  - npc.level > 4):
          npcLabel = '<cyan>NPC</cyan>';
          break;
        case (npc.level - player.level > 9):
          npcLabel = '<b><black>NPC</black></b>';
          break;
        case (npc.level - player.level > 5):
          npcLabel = '<red>NPC</red>';
          break;
        case (npc.level - player.level > 3):
          npcLabel = '<yellow>NPC</red>';
          break;
        default:
          npcLabel = '<green>NPC</green>';
          break;
      }
      B.sayAt(player, `[${npcLabel}] ` + npc.name + combatantsDisplay);
    });

    B.at(player, '[<yellow><b>Exits</yellow></b>: ');
      B.at(player, Array.from(room.exits).map(ex => ex.direction).join(' '));
      B.sayAt(player, ']');
  }

  function lookEntity(state, player, args) {
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
      return B.sayAt(player, "You don't see anything like that here.");
    }

    if (entity instanceof Player) {
      // TODO: Show player equipment?
      B.sayAt(player, `You see fellow player ${entity.name}.`);
      return;
    }

    B.sayAt(player, entity.description, 80);

    if (entity.timeUntilDecay) {
      B.sayAt(player, `You estimate that ${entity.name} will rot away in ${humanize(entity.timeUntilDecay)}.`);
    }

    const usable = entity.getBehavior('usable');
    if (usable) {
      if (usable.spell) {
        const useSpell = state.SpellManager.get(usable.spell);
        if (useSpell) {
          useSpell.options = usable.options;
          B.sayAt(player, useSpell.info(player));
        }
      }

      if (usable.effect && usable.config.description) {
        B.sayAt(player, usable.config.description);
      }

      if (usable.charges) {
        B.sayAt(player, `There are ${usable.charges} charges remaining.`);
      }
    }

    if (entity instanceof Item) {
      switch (entity.type) {
        case ItemType.WEAPON:
        case ItemType.ARMOR:
          return B.sayAt(player, renderItem(state, entity, player));
        case ItemType.CONTAINER: {
          if (!entity.inventory || !entity.inventory.size) {
            return B.sayAt(player, `${entity.name} is empty.`);
          }

          B.at(player, 'Contents');
          if (isFinite(entity.inventory.getMax())) {
            B.at(player, ` (${entity.inventory.size}/${entity.inventory.getMax()})`);
          }
          B.sayAt(player, ':');

          for (const [, item ] of entity.inventory) {
            B.sayAt(player, '  ' + item.display);
          }
          break;
        }
      }
    }
  }


  function getCombatantsDisplay(entity) {
    const combatantsList = [...entity.combatants.values()].map(combatant => combatant.name);
    return `, <red>fighting: </red><b>${combatantsList.join(", ")}</b>`;
  }
};
