'use strict';

module.exports = srcPath => {
  const B = require(srcPath + 'Broadcast');
  const Parser = require(srcPath + 'CommandParser').CommandParser;
  const say = B.sayAt;

  const PartyCommands = (state, player) => {
    return [
      {
        name: 'create',
        run(args) {
          if (player.party) {
            return say(player, "You're already in a group.");
          }

          state.PartyManager.create(player);
          say(player, "<b><green>You created a group, invite players with '<white>group invite <name></white>'</green></b>");
        }
      },

      {
        name: 'invite',
        run(args) {
          if (!player.party) {
            return say(player, "You don't have a group, create one with '<b>group create</b>'.");
          }

          if (player.party && player !== player.party.leader) {
            return say(player, "You aren't the leader of the group.");
          }

          if (!args.length) {
            return say(player, "Invite whom?");
          }

          const target = Parser.parseDot(args, player.room.players);

          if (target === player) {
            return say(player, "You ask yourself if you want to join your own group. You humbly accept.");
          }

          if (!target) {
            return say(player, "They aren't here.");
          }

          if (target.party) {
            return say(player, "They are already in a group.");
          }

          say(target, `<b><green>${player.name} invited you to join their group. Join/decline with '<white>group join/decline ${player.name}</white>'</green></b>`);
          say(player, `<b><green>You invite ${target.name} to join your group.</green></b>`);
          player.party.invite(target);
          B.prompt(target);
        }
      },

      {
        name: 'disband',
        run(args) {
          if (!player.party) {
            return say(player, "You aren't in a group.");
          }

          if (player !== player.party.leader) {
            return say(player, "You aren't the leader of the group.");
          }

          if (!args || args !== 'sure') {
            return say(player, `<b><green>You have to confirm disbanding your group with '<white>group disband sure</white>'</green></b>`);
          }

          say(player.party, '<b><green>Your group was disbanded!</green></b>');
          state.PartyManager.disband(player.party);
        }
      },

      {
        name: 'join',
        run(args) {
          if (!args.length) {
            return say(player, "Join whose group?");
          }

          const target = Parser.parseDot(args, player.room.players);

          if (!target) {
            return say(player, "They aren't here.");
          }

          if (!target.party || target !== target.party.leader) {
            return say(player, "They aren't leading a group.");
          }

          if (!target.party.isInvited(player)) {
            return say(player, "They haven't invited you to join their group.");
          }

          say(player, `<b><green>You join ${target.name}'s group.</green></b>`);
          say(target.party, `<b><green>${player.name} joined the group.</green></b>`);
          target.party.add(player);
          player.follow(target);
        }
      },

      {
        name: 'decline',
        run(args) {
          if (!args.length) {
            return say(player, "Decline whose invite?");
          }

          const target = Parser.parseDot(args, player.room.players);

          if (!target) {
            return say(player, "They aren't here.");
          }

          say(player, `<b><green>You decline to join ${target.name}'s group.</green></b>`);
          say(target, `<b><green>${player.name} declined to join your group.</green></b>`);
          target.party.removeInvite(player);
        }
      },

      {
        name: 'leave',
        run() {
          if (!player.party) {
            return say(player, "You're not in a group.");
          }

          const party = player.party;
          player.party.delete(player);
          say(party, `<b><green>${player.name} left the group.</green></b>`);
          say(player, '<b><green>You leave the group.</green></b>');
        }
      },

      {
        name: 'list',
        run(args) {
          if (!player.party) {
            return say(player, "You're not in a group.");
          }

          say(player, '<b>' + B.center(80, 'Group', 'green', '-') + '</b>');
          for (const member of player.party) {
            let tag = '   ';
            if (member === player.party.leader) {
              tag = '[L]';
            }
            say(player, `<b><green>${tag} ${member.name}</green></b>`);
          }
        }
      }
    ];
  };

  return {
    aliases: [ 'party' ],
    command: state => (args, player) => {

      if (!args || !args.length) {
        args = 'list';
      }

      const parts = args.split(' ');
      const commandName = parts[0];
      args = parts.slice(1).join(' ');

      let command = null;
      for (const partyCommand of PartyCommands(state, player)) {
        if (partyCommand.name.indexOf(commandName) === 0) {
          command = partyCommand;
          break;
        }
      }

      if (!command) {
        return say(player, "Not a valid party command.");
      }

      command.run(args);
    }
  };
};
