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

    let longest = 0;

    for (let slot in equipped) {
      const item     = items.get(equipped[slot]);
      const name     = item.getShortDesc();
      const weight   = item.getWeight();
      const contents = item.isContainer() ? item.getInventory() : false;
      equipment.set(slot, { name, weight, contents });

      longest = item.getShortDesc().length > longest ? 
        item.getShortDesc().length : 
        longest;
    }

    if (!equipment.size) {
      return player.warn(`You're stark naked, with nothing to your name...`);
    }

    player.say(
      `<bold>Your inventory:</bold>
      `);
    
    const displayListItem = item => player.say(`<cyan>${_.leftPad(nestingLevel)} - ${item.getShortDesc()}</cyan>`)

    for (let [slot, details] of equipment) {
      const details = { name, weight, contents };
      const padding = _.leftPad(longest - name.length);
      player.say(`<magenta><${slot}></magenta> <bold>${name}</bold> ${padding}<cyan>weight: ${weight} gravets</cyan>`);
      if (contents) {
        displayContainer(contents, 0);
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
