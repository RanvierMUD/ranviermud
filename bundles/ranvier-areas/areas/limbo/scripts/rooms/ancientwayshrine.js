'use strict';

module.exports = () => {
  const Ranvier = require('ranvier');
  const Broadcast = Ranvier.Broadcast;

  return  {
    listeners: {
      playerEnter: state => function (player) {
        Broadcast.sayAt(player);
        Broadcast.sayAt(player, `<b><cyan>Hint: Waypoints allow you to travel vast distances. Save waypoints with '<white>waypoint save</white>', set your preferred home with '<white>waypoint home</white>. If you have enough energy you can return home at any time with '<white>recall</white>'.</cyan></b>`, 80);
      }
    }
  };
};
