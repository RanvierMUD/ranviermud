'use strict';
const l10nFile = __dirname + '/../l10n/commands/inventory.yml';
const l10n = require('../src/l10n')(l10nFile);
const _    = require('../src/helpers');
const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {
    const inventory   = player.getInventory();
    const equipped    = player.getEquipped();

    if (!Object.keys(equipped).length) {
      return player.warn(`You're stark naked, with nothing to your name...`);
    }

    const equipment   = new Map();
    const longestSlot = Object.keys(equipped)
      .reduce((longest, key) => longest > key.length ? longest : key.length, 0);
   
    let longest = 0;

    for (let slot in equipped) {
      const item     = items.get(equipped[slot]);
      const name     = item.getShortDesc();
      const weight   = item.getWeight(items);
      const contents = item.isContainer() ? item.getInventory() : false;
      const capacity = item.isContainer() ? 
        getContainerCapacity(item) :
        null;
      equipment.set(slot, { name, weight, contents, capacity });

      longest = name.length > longest ? 
        name.length : 
        longest;
    }

    player.say(
      `<bold>Your inventory:</bold>
      <cyan>Encumbrance: ${player.getCarriedWeight(items)}/${player.getMaxCarryWeight()} gravets</cyan>
      `);
    
    const displayListItem = (name, nestingLevel) => player.say(`<cyan>${_.leftPad(nestingLevel)} - ${name}</cyan>`);

    for (let [slot, details] of equipment) {
      const { name, weight, contents, capacity } = details;
      const weightPadding = _.leftPad(longest - name.length);
      const namePadding   = _.leftPad(longestSlot - slot.length);
      player.say(`<magenta><${slot}></magenta>${namePadding} <bold>${name}</bold> ${weightPadding} | <cyan>weight: ${weight} gravets</cyan> ${printCap(capacity)}`);
      if (contents) {
        displayContainerContents(contents, 0, true);
      }
    }

    function displayContainerContents(contents, nestingLevel) {
      contents
        .map(items.get)
        .forEach(item => item.isContainer() ? 
          displayNestedContainer(item, nestingLevel) : 
          displayListItem(item.getShortDesc(), nestingLevel));
    }

    function displayNestedContainer(item, nestingLevel) {
      displayListItem(item.getShortDesc(), nestingLevel);
      displayContainerContents(item.getInventory(), nestingLevel + 1);
    }

    function getContainerCapacity(item) {
      return { 
        max:     item.getAttribute('maxSizeCapacity'), 
        current: item.getSizeOfContents(items) 
      };
    }

    function printCap(capacity) {
      if (!capacity) { return ''; }
      const { current, max } = capacity;
      return ` <green>${current}/${max} aums</green>`;
    }

  };
};
