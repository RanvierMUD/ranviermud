var CommandUtil = require('../src/command_util').CommandUtil;
var l10n_file = __dirname + '/../l10n/commands/look.yml';
var l10n = new require('localize')(require('js-yaml').load(require('fs').readFileSync(l10n_file).toString('utf8')), undefined, 'zz');
exports.command = function(rooms, items, players, npcs, Commands) {

  function checkForOtherPlayers(p) {
    return (p.getName() !== player.getName() && p.getLocation() === player.getLocation());
  };

  return function(args, player) {
    var room = rooms.getAt(player.getLocation());
    var locale = player.getLocale();

    if (args) {
      // Look at items in the room first
      var thing = CommandUtil.findItemInRoom(items, args, room, player, true);

      if (!thing) {
        // Then the inventory
        thing = CommandUtil.findItemInInventory(args, player, true);
      }

      if (!thing) {
        // then for an NPC
        thing = CommandUtil.findNpcInRoom(npcs, args, room, player, true);
      }

      if (!thing) {
        players.eachIf(checkForOtherPlayers(p),
          function(p) {
          	if (args === p.getName()){
            player.sayL10n(l10n, 'IN_ROOM', p.getName());
            player.say(p.getDescription());
        }
          });
      }

      if (!thing) {
        // then look at exits
        var exits = room.getExits();
        exits.forEach(function(exit) {
          if (args.toLowerCase() === exit.direction) {
            thing = rooms.getAt(exit.location);
            player.say(thing.getTitle(locale));
          }
        });
      }

      if (!thing) {
        player.sayL10n(l10n, 'ITEM_NOT_FOUND');
        return;
      }

      player.say(thing.getDescription(player.getLocale()));
      return;
    }


    if (!room) {
      player.sayL10n(l10n, 'LIMBO');
      return;
    }

    // Render the room and its exits
    player.say(room.getTitle(player.getLocale()));
    player.say(room.getDescription(player.getLocale()));
    player.say('');

    // display players in the same room
    players.eachIf(
      checkForOtherPlayers(p),
      function(p) {
        player.sayL10n(l10n, 'IN_ROOM', p.getName());
      });

    // show all the items in the rom
    room.getItems().forEach(function(id) {
      player.say('<magenta>' + items.get(id).getShortDesc(player.getLocale()) + '</magenta>');
    });

    // show all npcs in the room
    room.getNpcs().forEach(function(id) {
      var npc = npcs.get(id);
      if (npc) {
        var color = 'cyan';
        switch (true) {
          case ((npc.getAttribute('level') - player.getAttribute('level')) > 3):
            color = 'red';
            break;
          case ((npc.getAttribute('level') - player.getAttribute('level')) >= 1):
            color = 'yellow';
            break;
          default:
            color = 'green'
            break;
        }
        player.say('<' + color + '>' + npcs.get(id).getShortDesc(player.getLocale()) + '</' + color + '>');
      }
    });

    player.write('[');
    player.writeL10n(l10n, 'EXITS');
    player.write(': ');
    room.getExits().forEach(function(exit) {
      player.write(exit.direction + ' ');
    });
    player.say(']');
  }
};