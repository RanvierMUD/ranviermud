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

    const longestSlot = Object.keys(equipped)
      .reduce((longest, key) => longest > key.length ? longest : key.length, 0);
   
    let longest = 0;

    for (let slot in equipped) {
      const item     = items.get(equipped[slot]);
      const name     = item.getShortDesc();
      const weight   = item.getWeight();
      const contents = item.isContainer() ? item.getInventory() : false;
      equipment.set(slot, { name, weight, contents });

      longest = name.length > longest ? 
        name.length : 
        longest;
    }

    if (!equipment.size) {
      return player.warn(`You're stark naked, with nothing to your name...`);
    }

    player.say(
      `<bold>Your inventory:</bold>
      `);
    
    const displayListItem = (name, nestingLevel) => player.say(`<cyan>${_.leftPad(nestingLevel)} - ${name}</cyan>`);

    for (let [slot, details] of equipment) {
      const { name, weight, contents } = details;
      const weightPadding = _.leftPad(longest - name.length);
      const namePadding   = _.leftPad(longestSlot - slot.length);
      player.say(`<magenta><${slot}></magenta>${namePadding} <bold>${name}</bold> ${weightPadding} | <cyan>weight: ${weight} gravets</cyan>`);
      if (contents) {
        displayContainerContents(contents, 0, true);
      }
    }

    function displayContainerContents(contents, nestingLevel) {
      contents.forEach(item => item.isContainer() ? 
        displayNestedContainer(item, nestingLevel): 
        displayListItem(item.getShortDesc(), nestingLevel));
    }

    function displayNestedContainer(item, nestingLevel) {
      displayListItem(item.getShortDesc(), nestingLevel);
      displayContainerContents(item.getInventory(), nestingLevel + 1);
    }

  };
};
