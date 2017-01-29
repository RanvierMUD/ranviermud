'use strict';

const util = require('util');
const Data = require('./Data');
const Room = require('./Room');
const Character = require('./Character');
const Config = require('./Config');

class Player extends Character {
  constructor(data) {
    super(data);

    this.account = data.account || null;
    this.password  = data.password;
    this.prompt = '[ %health/%maxHealth <bold>hp</bold> -- %energy/%maxEnergy <bold>energy</bold> ]';
    this.combatPrompt = '[ %health/%maxHealth <bold>hp</bold> -- %energy/%maxEnergy <bold>energy</bold> ]';
    this.socket = data.socket || null;
    this.preferences = data.preferences || new Map();
  }

  /**
   * Convert prompt tokens into actual data
   * @param {string} prompt
   * @param {object} data
   */
  interpolatePrompt(prompt, data) {
    data = Object.assign(
      data || {},
      this.getAttributes()
    );

    for (const key in data) {
      prompt = prompt.replace('%' + key, data[key]);
    }

    // replace any unknown tokens
    prompt = prompt.replace(/%([a-z_]+?)/, '[BAD: $1');

    return prompt;
  }

  canGo(exit) {
    if (!this.room) {
      return false;
    }

    const exits = Array.from(this.room.exits).filter(e => e.direction.indexOf(exit) === 0);

    if (!exits.length) {
      return false;
    }

    if (exits.length > 1) {
      return false;
    }

    if (this.inCombat) {
      return false;
    }

    return true;
  }

  save(callback) {
    Data.save('player', this.name, this.serialize(), callback);
  }

  hydrate(state) {
    if (typeof this.room === 'string') {
      const room = state.RoomManager.getRoom(this.room);
      if (!room) {
        util.log(`WARNING: Player ${this.name} was saved to invalid room ${this.room}.`);
        this.emit('quit');
        return;
      }

      this.room = room;
      room.addPlayer(this);
    }

    if (Array.isArray(this.preferences)) {
      let prefMap = new Map();
      this.preferences.forEach(pref => {
        prefMap.set(pref.key, pref.value);
      });

      this.preferences = prefMap;
    }

    if (typeof this.account === 'string') {
      this.account = state.AccountManager.getAccount(this.account);
    }

    // Hydrate inventory
    if (Array.isArray(this.inventory)) {
      const itemDefs = this.inventory;
      this.inventory = new Map();
      itemDefs.forEach(itemDef => {
        let newItem = state.ItemFactory.create(state.AreaManager.getArea(itemDef.area), itemDef);
        newItem.hydrate(state);
        state.ItemManager.add(newItem);
        this.addItem(newItem);
      });
    }

    // Hydrate equipment
    if (this.equipment && !(this.equipment instanceof Map)) {
      const eqDefs = this.equipment;
      this.equipment = new Map();
      for (const slot in eqDefs) {
        const itemDef = eqDefs[slot];
        let newItem = state.ItemFactory.create(state.AreaManager.getArea(itemDef.area), itemDef);
        newItem.hydrate(state);
        state.ItemManager.add(newItem);
        this.equip(newItem);
      }
    } else {
      this.equipment = new Map();
    }

    // TODO: Hydrate effects
  }

  serialize() {
    let prefs = Array.from(this.preferences.entries()).map(pref => 
      ({
        key: pref[0],
        value: pref[1]
      }));

    let data = {
      name: this.name,
      account: this.account.name,
      attributes: this.attributes,
      combatPromptString: this.combatPromptString,
      experience: this.experience,
      level: this.level,
      password: this.password,
      prefs,
      promptString: this.promptString,
      room: Room.getKey(this.room),
    };

    data.inventory = this.inventory ?
      Array.from(this.inventory.values()).map(item => item.serialize()) :
      this.inventory;

    if (this.equipment) {
      let eq = {};
      for (let [ slot, item ] of this.equipment) {
        eq[slot] = item.serialize();
      }
      data.equipment = eq;
    } else {
      data.equipment = null;
    }

    return data;
  }

  /**
   * Used by Broadcaster
   * @return {Array<Character>}
   */
  getBroadcastTargets() {
    return [this];
  }

  static validateName(name) {
    const maxLength = Config.get('maxPlayerNameLength');
    const minLength = Config.get('minPlayerNameLength');

    if (!name) {
      return 'Please enter a name.';
    }
    if (name.length > maxLength) {
      return 'Too long, try a shorter name.';
    }
    if (name.length < minLength) {
      return 'Too short, try a longer name.';
    }
    if (!/^[a-z]+$/i.test(name)) {
      return 'Your name may only contain A-Z without spaces or special characters.';
    }
    return false;
  }

}

module.exports = Player;
