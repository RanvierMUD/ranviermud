'use strict';
const EventEmitter = require('events');
const util = require('util');

/**
 * @property {Area}          area         Area room is in
 * @property {Array<number>} defaultItems Default list of item ids that should load in this room
 * @property {Array<number>} defaultNpcs  Default list of npc ids that should load in this room
 * @property {string}        description  Room description seen on 'look'
 * @property {Array<object>} exits        Exits out of this room { id: number, direction: string, leaveMessage: string }
 * @property {number}        id           Area-relative id (vnum)
 * @property {Set}           items        Items currently in the room
 * @property {Set}           npcs         Npcs currently in the room
 * @property {Set}           players      Players currently in the room
 * @property {string}        script       Name of custom script attached to this room
 * @property {string}        title        Title shown on look/scan
 */
class Room extends EventEmitter {
  constructor(area, def) {
    super();
    var required = ['title', 'description', 'id'];
    for (const prop of required) {
      if (!(prop in def)) {
        throw new Error(`ERROR: AREA[${area.name}] Room does not have required property ${prop}`);
      }
    }

    this.area = area;
    this.defaultItems = def.items || [];
    this.defaultNpcs  = def.npcs || [];
    this.behaviors  = def.behaviors || [];
    this.description = def.description;
    this.entityReference = this.area.name + ':' + def.id;
    this.exits = def.exits;
    this.id = def.id;
    this.script = def.script;
    this.title = def.title;

    this.items = new Set();
    this.npcs = new Set();
    this.players = new Set();
  }

  addPlayer(player) {
    this.players.add(player);
  }

  removePlayer(player) {
    this.players.delete(player);
  }

  addNpc(npc) {
    this.npcs.add(npc);
    npc.room = this;
    this.area.addNpc(npc);
  }

  removeNpc(npc) {
    this.npcs.delete(npc);
    npc.room = null;
    this.area.removeNpc(npc);
  }

  addItem(item) {
    this.items.add(item);
    item.room = this;
  }

  removeItem(item) {
    this.items.delete(item);
    item.room = null;
  }

  hydrate(state) {
    this.items = new Set();

    // NOTE: This method effectively defines the fact that items/npcs do not
    // persist through reboot unless they're stored on a player.
    // If you would like to change that functionality this is the place

    this.defaultItems.forEach(defaultItemId => {
      if (parseInt(defaultItemId, 10)) {
        defaultItemId = this.area.name + ':' + defaultItemId;
      }

      util.log(`\tDIST: Adding item [${defaultItemId}] to room [${this.title}]`);
      const newItem = state.ItemFactory.create(this.area, defaultItemId);
      newItem.hydrate(state);
      state.ItemManager.add(newItem);
      this.addItem(newItem);
    });

    this.defaultNpcs.forEach(defaultNpcId => {
      if (parseInt(defaultNpcId, 10)) {
        defaultNpcId = this.area.name + ':' + defaultNpcId;
      }

      util.log(`\tDIST: Adding npc [${defaultNpcId}] to room [${this.title}]`);
      const newNpc = state.MobFactory.create(this.area, defaultNpcId);
      newNpc.hydrate(state);
      this.area.addNpc(newNpc);
      this.addNpc(newNpc);
      newNpc.emit('spawn');
    });

    if (this.behaviors) {
      this.behaviors.forEach(behaviorName => {
        let behavior = state.RoomBehaviorManager.get(behaviorName);
        if (!behavior) {
          return;
        }

        behavior.attach(this);
      });
    }
  }

  /**
   * Used by Broadcaster
   * @return {Array<Character>}
   */
  getBroadcastTargets() {
    return Array.from(this.players.values());
  }
}

module.exports = Room;
