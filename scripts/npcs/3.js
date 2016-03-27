exports.listeners = {
  playerEnter: function() {
    return function(room, rooms, player, players, npc) {
      var rand = Math.floor(Math.random() * 5 + 1);
      if (rand > 3) {
        player.say('The defiler\'s maw glistens with spittle as it eyes its prey.');
      }
    }
  },
  playerDropItem: function() {
    return function(room, player) {
      player.say('The defiler croaks, its tongue lolling obscenely out.');
    }
  },
};
