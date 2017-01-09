'use strict';

const util = require('util');
const Data = require('./Data');
const Room = require('./Room');
const Character = require('./Character');

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

    // TODO: Hydrate items
    // TODO: Hydrate effects
  }

  serialize() {
    let prefs = Array.from(this.preferences.entries()).map(pref => {
      return {
        key: pref[0],
        value: pref[1]
      };
    });

    let data = {
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
      Array.from(this.inventory.values()).map(item => item.serialize) :
      this.inventory
    ;
    data.equipment = this.equipment ?
      Array.from(this.equipment.values()).map(item => item.serialize) :
      this.equipment
    ;

    return data;
  }

  /**
   * Used by Broadcaster
   * @return {Array<Character>}
   */
  getBroadcastTargets() {
    return [this];
  }
}

module.exports = Player;
