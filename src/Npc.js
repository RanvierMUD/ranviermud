'use strict';

const Character = require('./Character');
const uuid = require('node-uuid');

/**
 * @property {number} id   Area-relative id (vnum)
 * @property {Area}   area Area npc belongs to (not necessarily the area they're currently in)
 * @property {
 */
class Npc extends Character {
  constructor(area, data) {
    super(data);
    const validate = ['keywords', 'name', 'id'];

    for (const prop of validate) {
      if (!(prop in data)) {
        throw new ReferenceError(`NPC in area [${area.name}] missing required property [${prop}]`)
      }
    }

    this.defaultItems = data.items || [];
    this.defaultEquipment = data.equipment || [];
    this.area = data.area;
    this.keywords = data.keywords;
    this.description = data.description;
    this.id = data.id;
    this.uuid = data.uuid || uuid.v4();
  }

  hydrate(state) {
    super.hydrate(state);

    this.defaultItems.forEach(defaultItemId => {
      if (parseInt(defaultItemId, 10)) {
        defaultItemId = this.area.name + ':' + defaultItemId;
      }

      console.log(`\tADDING: Adding item [${defaultItemId}] to npc [${this.name}]`);
      const newItem = state.ItemFactory.create(this.area, defaultItemId);
      newItem.hydrate(state);
      state.ItemManager.add(newItem);
      this.addItem(newItem);
    });
  }
}

module.exports = Npc;
