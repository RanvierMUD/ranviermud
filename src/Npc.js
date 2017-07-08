'use strict';

const uuid = require('node-uuid');
const Attributes = require('./Attributes');
const Character = require('./Character');
const Config = require('./Config');
const Logger = require('./Logger');

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

    this.area = data.area;
    this.behaviors = new Map(Object.entries(data.behaviors || {}));
    this.damage = data.damage;
    this.defaultEquipment = data.equipment || [];
    this.defaultItems = data.items || [];
    this.description = data.description;
    this.entityReference = data.entityReference; 
    this.id = data.id;
    this.keywords = data.keywords;
    this.pacifist = data.pacifist || false;
    this.quests = data.quests || [];
    this.uuid = data.uuid || uuid.v4();
  }


  /**
   * @param {string} name
   * @return {boolean}
   */
  hasBehavior(name) {
    return this.behaviors.has(name);
  }

  /**
   * @param {string} name
   * @return {*}
   */
  getBehavior(name) {
    return this.behaviors.get(name);
  }

  /**
   * Move the npc to the given room, emitting events appropriately
   * @param {Room} nextRoom
   * @param {function} onMoved Function to run after the npc is moved to the next room but before enter events are fired
   */
  moveTo(nextRoom, onMoved = _ => _) {
    if (this.room) {
      this.room.emit('npcLeave', this, nextRoom);
      this.room.removeNpc(this);
    }

    this.room = nextRoom;
    nextRoom.addNpc(this);

    onMoved();

    nextRoom.emit('npcEnter', this);
    this.emit('enterRoom', nextRoom);
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

      Logger.verbose(`\tDIST: Adding item [${defaultItemId}] to npc [${this.name}]`);
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
