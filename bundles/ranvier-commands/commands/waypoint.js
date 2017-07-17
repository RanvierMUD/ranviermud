'use strict';

const sprintf = require('sprintf-js').sprintf;

module.exports = srcPath => {
  const B = require(srcPath + 'Broadcast');
  const CommandManager = require(srcPath + 'CommandManager');

  const subcommands = new CommandManager();
  subcommands.add({
    name: 'list',
    command: state => (args, player) => {
      const waypoints = player.getMeta('waypoints');

      if (!waypoints || !waypoints.saved.length) {
        return B.sayAt(player, 'You haven\'t saved any waypoints.');
      }

      B.sayAt(player, 'Waypoints:');
      for (const [i, savedWaypoint] of Object.entries(waypoints.saved)) {
        const room = state.RoomManager.getRoom(savedWaypoint);
        B.sayAt(player, sprintf('%2s) %s%s', i + 1, waypoints.home === room.entityReference ? '(H) ' : '', room.title));
      }
    }
  });

  subcommands.add({
    name: 'save',
    command: state => (args, player) => {
      if (!player.room.hasBehavior('waypoint')) {
        return B.sayAt(player, 'You are not at a wayshrine.');
      }

      let waypoints = player.getMeta('waypoints');

      waypoints = waypoints || {
        saved: [],
        home: null
      };

      if (waypoints.saved.includes(player.room.entityReference)) {
        return B.sayAt(player, 'You already saved this waypoint.');
      }

      waypoints.saved.push(player.room.entityReference);
      player.setMeta('waypoints', waypoints);
      B.sayAt(player, `${player.room.title} saved to your waypoints. Use '<b>waypoint home</b>' to set as your home waypoint.`);
    }
  });

  subcommands.add({
    name: 'home',
    command: state => (args, player) => {
      if (!player.room.hasBehavior('waypoint')) {
        return B.sayAt(player, 'You are not at a wayshrine.');
      }

      const waypoints = player.getMeta('waypoints');

      if (!waypoints || !waypoints.saved.includes(player.room.entityReference)) {
        return B.sayAt(player, 'You haven\'t saved this wayshrine.');
      }

      player.setMeta('waypoints.home', player.room.entityReference);
      B.sayAt(player, `${player.room.title} is now your home waypoint.`);
    }
  });

  subcommands.add({
    name: 'travel',
    command: state => (args, player) => {
      if (!args || !args.length) {
        return B.sayAt(player, 'Travel where? (waypoint travel #)');
      }

      if (!player.room.hasBehavior('waypoint')) {
        return B.sayAt(player, 'You may only travel while at a waypoint.');
      }

      const waypoints = player.getMeta('waypoints');

      if (!waypoints || !waypoints.saved.length) {
        return B.sayAt(player, 'You haven\'t saved any waypoints.');
      }

      const index = parseInt(args, 10) - 1;
      if (isNaN(index) || !waypoints.saved[index]) {
        return B.sayAt(player, 'Invalid waypoint.');
      }

      const waypoint = waypoints.saved[index];
      const nextRoom = state.RoomManager.getRoom(waypoint);

      B.sayAt(player, '<b><cyan>You walk up and touch the waypillar, you are consumed by a bright blue light.</cyan></b>');
      B.sayAtExcept(player.room, `<b><cyan>${player.name} walks up and touches the waypillar and disappears in a flash of blue light.</cyan></b>`, [player]);

      player.moveTo(nextRoom, _ => {
        state.CommandManager.get('look').execute('', player);

        B.sayAt(player, '<b><cyan>The blue light dims and you find yourself at the next wayshrine.</cyan></b>');
        B.sayAtExcept(player.room, `<b><cyan>The waypiller glows brightly and ${player.name} appears in a flash of blue light.</cyan></b>`, [player]);
      });
    }
  });

  return {
    usage: 'waypoint list, save, travel #',
    command: state => (args, player) => {
      if (!args || !args.length) {
        args = 'list';
      }

      const [ command, ...commandArgs ] = args.split(' ');
      const subcommand = subcommands.find(command);

      if (!subcommand) {
        return B.sayAt(player, 'Invalid waypoint command.');
      }

      subcommand.command(state)(commandArgs.join(' '), player);
    }
  };
};
