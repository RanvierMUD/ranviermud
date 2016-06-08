'use strict';
const CommandUtil = require('../src/command_util')
  .CommandUtil;
const sprintf = require('sprintf')
  .sprintf;
const l10nFile = __dirname + '/../l10n/commands/look.yml';
const l10n = new require('jall')(require('js-yaml')
  .load(require('fs')
    .readFileSync(
      l10nFile)
    .toString('utf8')), undefined, 'zz');
const wrap = require('wrap-ansi');
const util = require('util');
const Time = require('../src/time').Time;

l10n.throwOnMissingTranslation(false);

exports.command = (rooms, items, players, npcs, Commands) => {

  return (args, player, hasExplored) => {
    const room = rooms.getAt(player.getLocation());
    const locale = player.getLocale();

    let thingIsPlayer = false;

    if (args) {
      args = args.toLowerCase();

      // Look at items in the room first
      let thing = CommandUtil.findItemInRoom(items, args, room, player,
        true);

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
        thingIsPlayer = true;
      }

      function isLookingAtSelf() {
        const me = ['me', 'self', player.getName().toLowerCase()];
        return me.indexOf(args) !== -1;
      }

      // Then other players
      if (!thing) {
        players.eachIf(
          CommandUtil.otherPlayerInRoom.bind(null, player),
          lookAtOther);
      }

      function lookAtOther(p) {
        if (args === p.getName().toLowerCase()) {
          thing = p;
          player.sayL10n(l10n, 'IN_ROOM', thing.getName());
          thingIsPlayer = true;
          p.sayL10n(l10n, 'BEING_LOOKED_AT', player.getName());
        }
      }


      // Then look at exits
      //TODO: Improve based on player stats/skills?
      if (!thing) {
        const exits = room.getExits();
        exits.forEach(exit => {
          if (args === exit.direction) {
            thing = rooms.getAt(exit.location);
            player.say(thing.getTitle(locale));
          }
        });
      }

      if (!thing) {
        player.sayL10n(l10n, 'ITEM_NOT_FOUND');
        return;
      }

      player.say(thing.getDescription(locale));
      if (thingIsPlayer) showPlayerEquipment(thing, player);

      return;
    }

    if (!room) {
      player.sayL10n(l10n, 'LIMBO');
      util.log(player.getName() + ' is in limbo.');
      return;
    }

    // Render the room and its exits
    player.say(room.getArea() + ': ' + room.getTitle(locale));

    const descPreference = player.getPreference('roomdescs');

    if (Time.isDay()) {

      const showShortByDefault = (hasExplored === true && !descPreference === 'verbose');

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
    players.eachIf(CommandUtil.otherPlayerInRoom.bind(null, player),
      p => player.sayL10n(l10n, 'IN_ROOM', p.getName())
    );

    // show all the items in the rom
    room.getItems()
      .forEach(id => {
        player.say('<magenta>'
        + items.get(id).getShortDesc(locale)
        + '</magenta>');
      });

    // show all npcs in the room
    room.getNpcs()
      .forEach(id => {
        var npc = npcs.get(id);

        if (npc) {
          var npcLevel = npc.getAttribute('level');
          var playerLevel = player.getAttribute('level');
          var color = 'cyan';

          if ((npcLevel - playerLevel) > 3)
            color = 'red';
          else if ((npcLevel - playerLevel) >= 1)
            color = 'yellow';
          else if (npcLevel === playerLevel)
            color = 'green';

          player.say('<' + color + '>'
            + npc.getShortDesc(player.getLocale())
            + '</' + color + '>');
        }
      });

    player.write('[');
    player.write('<yellow><bold>Obvious exits: </yellow></bold>');
    room.getExits()
      .forEach(exit => player.write(exit.direction + ' '));
    player.say(']');

    function showPlayerEquipment(playerTarget, playerLooking) {
      var naked = true;
      var equipped = playerTarget.getEquipped();
      for (var i in equipped) {
        var item = items.get(equipped[i]);
        naked = false;
        playerLooking.say(sprintf("%-15s %s", "<" + i + ">", item.getShortDesc(
          playerLooking.getLocale())));
      }
      if (naked) playerLooking.sayL10n(l10n, "NAKED");
    }

  }
};
