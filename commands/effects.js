'use strict';
const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) => 
  (args, player) => { 
    for (let [id, effect] of player.getEffects()) {
      player.say(`<blue>${effect.getName()}</blue>`);
      
      const desc = effect.getDescription();
      if (desc) { player.say(desc); }
      player.say(``);
    }
  }