'use strict';
const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) => 
  (args, player) => { 
    const effects = player.getEffects();

    if (!effects.size) { return player.warn('You are not under any effects.'); }

    for (let [id, effect] of effects) {
      player.say(`<blue>${effect.getName()}</blue>`);
      
      const desc = effect.getDescription();
      if (desc) { player.say(desc); }
      player.say(``);
    }
  }