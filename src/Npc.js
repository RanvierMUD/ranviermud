'use strict';

const util = require('util');
const uuid = require('node-uuid');
const Attributes = require('./Attributes');
const Character = require('./Character');
const Config = require('./Config');

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
        throw new ReferenceError(`NPC in area [${area.name}] missing required property [${prop}]`);
      }
    }

    this.defaultItems = data.items || [];
    this.defaultEquipment = data.equipment || [];
    this.behaviors = new Map(Object.entries(data.behaviors || {}));
    this.area = data.area;
    this.keywords = data.keywords;
    this.description = data.description;
    this.id = data.id;
    this.uuid = data.uuid || uuid.v4();
    this.quests = data.quests || [];
    this.damage = data.damage;
    this.entityReference = data.entityReference; 
    this.attributes = new Attributes(Object.assign(Config.get('defaultAttributes'), data.attributes));
  }


  /**
   * @param {string} behavior
   * @return {boolean}
   */
  hasBehavior(behavior) {
    return this.behaviors.has(behavior);
  }

  serialize() {
    return Object.assign(super.serialize(), { damage: this.damage });
  }

  getDamage() {
    const range = this.damage.split('-');
    return { min: range[0], max: range[1] };
  }

  hydrate(state) {
    super.hydrate(state);

    this.setAttributeToMax('health');

    this.defaultItems.forEach(defaultItemId => {
      if (parseInt(defaultItemId, 10)) {
        defaultItemId = this.area.name + ':' + defaultItemId;
      }

      util.log(`\tDIST: Adding item [${defaultItemId}] to npc [${this.name}]`);
      const newItem = state.ItemFactory.create(this.area, defaultItemId);
      newItem.hydrate(state);
      state.ItemManager.add(newItem);
      this.addItem(newItem);
    });

    for (const [behaviorName, config] of this.behaviors) {
      let behavior = state.MobBehaviorManager.get(behaviorName);
      if (!behavior) {
        return;
      }

      // behavior may be a boolean in which case it will be `behaviorName: true`
      behavior.attach(this, config === true ? {} : config);
    }
  }

  get isNpc() {
    return true;
  }
}

module.exports = Npc;
