'use strict';

const Attributes = require('./Attributes');
const Character = require('./Character');
const CommandQueue = require('./CommandQueue');
const Config = require('./Config');
const Data = require('./Data');
const QuestTracker = require('./QuestTracker');
const Room = require('./Room');
const Logger = require('./Logger');

/**
 * @property {Account} account
 * @property {number}  experience current experience this level
 * @property {string}  password
 * @property {string}  prompt     default prompt string
 * @property {net.Socket} socket
 * @property {QuestTracker} questTracker
 * @property {Map<string,function ()>} extraPrompts Extra prompts to render after the default prompt
 * @property {{completed: Array, active: Array}} questData
 */
class Player extends Character {
  constructor(data) {
    super(data);

    this.account = data.account || null;
    this.attributes = new Attributes(data.attributes || Config.get('defaultAttributes'));
    this.experience = data.experience || 0;
    this.extraPrompts = new Map();
    this.password  = data.password;
    this.playerClass = null;
    this.prompt = ({healthStr, energyStr, }) => `[ ${healthStr} <bold>hp</bold> -- ${energyStr} <bold>energy</bold> ]`;
    this.socket = data.socket || null;
    const questData = Object.assign({
      completed: [],
      active: []
    }, data.quests);

    this.questTracker = new QuestTracker(this, questData.active, questData.completed);
    this.commandQueue = new CommandQueue();

    // Arbitrary data bundles are free to shove whatever they want in
    // WARNING: values must be JSON.stringify-able
    this.metadata = data.metadata || {};
    this.playerClass = null;
  }

  /**
   * Set a metadata value. Does _not_ autovivify, you will need to create the parent objects if they don't exist
   * @param {string} key   Key to set. Supports dot notation e.g., `"foo.bar"`
   * @param {*}      value Value must be JSON.stringify-able
   */
  setMeta(key, value) {
    let parts = key.split('.');
    const property = parts.pop();
    let base = this.metadata;

    while (parts.length) {
      let part = parts.pop();
      if (!(part in base)) {
        throw new RangeError(`Metadata path invalid: ${key}`);
      }
      base = base[parts.pop()];
    }

    base[property] = value;
  }

  /**
   * Get metadata about a player
   * @param {string} key Key to fetch. Supports dot notation e.g., `"foo.bar"`
   * @return {*}
   */
  getMeta(key) {
    let parts = key.split('.');
    const property = parts.pop();
    let base = this.metadata;

    while (parts.length) {
      let part = parts.pop();
      if (!(part in base)) {
        return undefined;
      }
      base = base[part];
    }

    return base[property];
  }

  /**
   * @see CommandQueue::enqueue
   */
  queueCommand(executable, lag) {
    const index = this.commandQueue.enqueue(executable, lag);
    this.emit('commandQueued', index);
  }

  /**
   * Proxy all events on the player to the quest tracker
   * @param {string} event
   * @param {...*}   args
   */
  emit(event, ...args) {
    super.emit(event, ...args);

    this.questTracker.emit(event, ...args);
  }

  /**
   * Convert prompt tokens into actual data
   * @param {function} promptBuilder (data) => prompt template
   * @param {object} extraData (key is used by promptBuilder)
   */
  interpolatePrompt(promptBuilder, extraData = {}) {
    const buildAttributeStr = attr => `${this.getAttribute(attr)}/${this.getMaxAttribute(attr)}`;
    const healthStr = buildAttributeStr('health');
    const energyStr = buildAttributeStr('energy');

    // TODO: The attr strings could likely be built in a more programmatic fashion.
    // How could this be redone to allow for customization of the prompt without major
    // edits to the Player class?
    const promptData = Object.assign({}, extraData, {
      healthStr, energyStr
    });

    return promptBuilder(promptData);
  }

  /**
   * Add a line of text to be displayed immediately after the prompt when the prompt is displayed
   * @param {string}      id       Unique prompt id
   * @param {function ()} renderer Function to call to render the prompt string
   * @param {?boolean}    removeOnRender When true prompt will remove itself once rendered
   *    otherwise prompt will continue to be rendered until removed.
   */
  addPrompt(id, renderer, removeOnRender = false) {
    this.extraPrompts.set(id, { removeOnRender, renderer });
  }

  /**
   * @param {string} id
   */
  removePrompt(id) {
    this.extraPrompts.delete(id);
  }

  /**
   * Determine if a player can leave the current room to a given direction
   * TODO: This shouldn't be here but there's not better place at the moment
   * @param {string} direction
   * @return {boolean}
   */
  canGo(direction) {
    if (!this.room) {
      return false;
    }

    const exits = Array.from(this.room.exits).filter(e => e.direction.indexOf(direction) === 0);

    if (!exits.length) {
      return false;
    }

    if (exits.length > 1) {
      return false;
    }

    if (this.isInCombat()) {
      return false;
    }

    return true;
  }

  save(callback) {
    Data.save('player', this.name, this.serialize(), callback);
  }

  hydrate(state) {
    if (typeof this.room === 'string') {
      let room = state.RoomManager.getRoom(this.room);
      if (!room) {
        Logger.warn(`WARNING: Player ${this.name} was saved to invalid room ${this.room}.`);
        room = state.RoomManager.getStartingRoom();
      }

      this.room = room;
      room.addPlayer(this);
    }

    if (typeof this.account === 'string') {
      this.account = state.AccountManager.getAccount(this.account);
    }

    if (this.getMeta('class')) {
      this.playerClass = state.ClassManager.get(this.getMeta('class'));
    }

    // Hydrate inventory
    this.inventory.hydrate(state);

    // Hydrate equipment
    // maybe refactor Equipment to be an object like Inventory?
    if (this.equipment && !(this.equipment instanceof Map)) {
      const eqDefs = this.equipment;
      this.equipment = new Map();
      for (const slot in eqDefs) {
        const itemDef = eqDefs[slot];
        let newItem = state.ItemFactory.create(state.AreaManager.getArea(itemDef.area), itemDef.entityReference);
        newItem.inventory = itemDef.inventory;
        newItem.hydrate(state);
        state.ItemManager.add(newItem);
        newItem.isEquipped = true;
        this.equip(newItem);
      }
    } else {
      this.equipment = new Map();
    }

    // Hydrate quests
    this.questTracker.hydrate(state);

    super.hydrate(state);
  }

  serialize() {
    let data = Object.assign(super.serialize(), {
      playerClass: this.playerClass && this.playerClass.id,
      account: this.account.name,
      experience: this.experience,
      inventory: this.inventory && this.inventory.serialize(),
      password: this.password,
      quests: this.questTracker.serialize(),
      metadata: this.metadata,
    });

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
