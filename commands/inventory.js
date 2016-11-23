'use strict';
const l10nFile = __dirname + '/../l10n/commands/inventory.yml';
const l10n = require('../src/l10n')(l10nFile);
const _    = require('../src/helpers');
const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {
    const inventory   = player.getInventory();
    const equipped    = player.getEquipped();
    const equipment   = new Map();

    for (let slot in equipped) {
      equipment.set(slot, items.get(equipped[slot]));
    }

    if (!equipped.length) {
      return player.warn(`You're stark naked, with nothing to your name...`);
    }

    player.say(
      `<bold>Your inventory:</bold>
      `);
    
    const displayListItem = item => player.say(`<cyan>${_.leftPad(nestingLevel)} - ${item.getShortDesc()}</cyan>`)

    for (let [slot, item] of equipment) {
      player.say(`<magenta><${slot}></magenta> <bold>${item.getShortDesc()}</bold> <cyan>weight: ${item.getWeight()} gravets</cyan>`);
      if (item.isContainer()) {
        displayContainer(item, 0);
      }
    }


    function displayContainerContents(item, nestingLevel) {
      const contents = container.getInventory();
        if (!contents.length) { return; }
        
        player.say("<bold>CONTENTS: </bold>");
        contents.forEach(item => item.isContainer() ? 
          displayContainerContents(item, nestingLevel + 1) : 
          displayListItem(item, nestingLevel));
    }

  };
};
