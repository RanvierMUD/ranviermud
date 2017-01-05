'use strict';
const CommandUtil = require('../src/command_util')
  .CommandUtil;
const sprintf = require('sprintf')
  .sprintf;
const l10nFile = __dirname + '/../l10n/commands/look.yml';
const l10n = new require('jall')(require('js-yaml').load(require('fs')
    .readFileSync(l10nFile).toString('utf8')), undefined, 'zz');
const wrap  = require('wrap-ansi');
const util  = require('util');

const Time  = require('../src/time').Time;
const Doors = require('../src/doors').Doors;
const Type  = require('../src/type').Type;
const _     = require('../src/helpers');

l10n.throwOnMissingTranslation(false);

//TODO: Test and refactor.

exports.command = (rooms, items, players, npcs, Commands) => {

  return (args, player, hasExplored) => {
    const room = rooms.getAt(player.getLocation());
    const locale = 'en';

    if (args) {
      args = args.toLowerCase();

      // Look at items in the room first
      let thing = CommandUtil.findItemInRoom(items, args, room, player,true);

      if (thing) util.log('found an item');

      if (!thing) {
        // Then the inventory
        thing = CommandUtil.findItemInInventory(args, player, true);
      }

      if (!thing) {
        // Then for an NPC
        thing = CommandUtil.findNpcInRoom(npcs, args, room, player, true);
      }

      // Then the player themselves
      if (!thing && isLookingAtSelf()) {
        thing = player;
      }

      function isLookingAtSelf() {
        const lookAtMe = ['me', 'self', player.getName().toLowerCase()];
        return _.has(lookAtMe, args);
      }

      // Then other players
      if (!thing) {
        players.eachExcept( player,
          p => {
            if (p.getLocation() === player.getLocation()) {
              lookAtOther(p);
            }
          });
      }

      function lookAtOther(p) {
        const otherName = p.getName().toLowerCase();
        if (args === otherName) {
          thing = p;
          player.say(thing.getName() + ' is here.');
          p.sayL10n(l10n, 'BEING_LOOKED_AT', player.getName());
        }
      }


      // Then look at exits
      //TODO: Improve based on player stats/skills?
      //FIXME: This does not really seem to be working.
      //FIXME: Consider making it a 'scout' command/skill.
      if (!thing) {
        const exits       = room.getExits();
        const isExit      = exit => (args === exit.direction);
        const foundExit   = exits.find(isExit);
        const canSee      = foundExit ? Doors.isOpen(foundExit) : false;

        if (canSee) {
          thing = rooms.getAt(foundExit.location);
        } else if (foundExit) {
          return player.warn('There is a door in the way...');
        }

      }

      if (!thing) {
        return player.sayL10n(l10n, 'ITEM_NOT_FOUND');
      }

      player.say(wrap(thing.getDescription(locale), 80));
      if (Type.isPlayer(thing)) { showPlayerEquipment(thing, player); }
      if (Type.isItem(thing) && thing.isContainer()) {
        showContainerContents(thing, player);
      }
      return;
    }

    function showContainerContents(container, player) {
      player.say("<bold>CONTENTS: </bold>");
      const contents = container.getInventory();

      if (!contents || !contents.length) {
        return player.say('<cyan>empty</cyan>');
      }

      contents
        .map(items.get)
        .forEach(item => player.say(`<cyan> - ${item.getRoomDesc()}</cyan>`));
    }

    if (!room) {
      util.log(player.getName() + ' is in limbo.');
      return player.say('You are in a deep, dark void.');
    }

    // Render the room and its exits
    player.say(room.getArea() + ': ' + room.getTitle(locale));

    const descPreference = player.getPreference('roomdescs');

    if (Time.isDay()) {
      const showShortByDefault = hasExplored && descPreference !== 'verbose';
      if (showShortByDefault || descPreference === 'short') {
        player.say(wrap(room.getShortDesc(locale), 80));
      } else {
        player.say(wrap(room.getDescription(locale), 80));
      }

    } else {
      player.say(wrap(room.getDarkDesc(locale), 80));
    }

    player.say('');

    // display players in the same room
    players.eachIf(
      p => CommandUtil.inSameRoom(player, p),
      p => player.sayL10n(l10n, 'IN_ROOM', p.getName()));

    // show all the items in the rom
    room.getItems()
      .forEach(id => {
        player.say('<magenta>'
        + items.get(id).getRoomDesc(locale)
        + '</magenta>');
      });

    // show all npcs in the room
    room.getNpcs()
      .forEach(id => {
        const npc = npcs.get(id);

        if (npc) {
          const npcLevel    = npc.getAttribute('level');
          const playerLevel = player.getAttribute('level');
          const difference  = npcLevel - playerLevel;

          const color = getNpcColor(difference)
          const desc  = npc.getRoomDesc('en');

          player.say(
              '<'  + color + '>'
            +        desc
            + '</' + color + '>');
        }
      });

    player.write('[');
    player.write('<yellow><bold>Obvious exits: </yellow></bold>');
    room.getExits()
      .forEach(exit => player.write(exit.direction + ' '));
    player.say(']');

    function showPlayerEquipment(playerTarget, playerLooking) {
      const equipped = playerTarget.getEquipped();
      for (const slot in equipped) {
        const item = items.get(equipped[slot]);
        playerLooking.say( sprintf(
            "%-15s %s", "<" + slot + ">",
            item.getShortDesc(playerLooking.getLocale())
          ));
      }

      const naked = Object.keys(equipped).length === 0;
      if (naked) {
        const pronoun = playerTarget === playerLooking ? 'You' : 'They';
        playerLooking.say(pronoun + " are naked!");
      }
    }

  }
};

function getNpcColor(difference) {
  if (difference > 3)  return 'red';
  if (difference >= 1) return 'yellow';
  if (!difference)     return 'green';
  return 'cyan';
}
