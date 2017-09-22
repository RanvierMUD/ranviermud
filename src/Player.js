'use strict';

const Attributes = require('./Attributes');
const Character = require('./Character');
const CommandQueue = require('./CommandQueue');
const Config = require('./Config');
const Data = require('./Data');
const QuestTracker = require('./QuestTracker');
const Room = require('./Room');
const Logger = require('./Logger');
const PlayerRoles = require('./PlayerRoles');

/**
 * @property {Account} account
 * @property {number}  experience current experience this level
 * @property {string}  password
 * @property {string}  prompt     default prompt string
 * @property {net.Socket} socket
 * @property {QuestTracker} questTracker
 * @property {Map<string,function ()>} extraPrompts Extra prompts to render after the default prompt
 * @property {{completed: Array, active: Array}} questData
 * @extends Character
 */
class Player extends Character {
  constructor(data) {
    super(data);

    this.account = data.account || null;
    this.experience = data.experience || 0;
    this.extraPrompts = new Map();
    this.password  = data.password;
    this.playerClass = null;
    this.prompt = data.prompt || '[ %health.current%/%health.max% <bold>hp</bold> ]';
    this.socket = data.socket || null;
    const questData = Object.assign({
      completed: [],
      active: []
    }, data.quests);

    this.questTracker = new QuestTracker(this, questData.active, questData.completed);
    this.commandQueue = new CommandQueue();
    this.role = data.role || PlayerRoles.PLAYER;

    this.playerClass = null;

    // Default max inventory size config
    if (!isFinite(this.inventory.getMax())) {
      this.inventory.setMax(Config.get('defaultMaxPlayerInventory') || 20);
    }
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
   * @param {string} promptStr
   * @param {object} extraData Any extra data to give the prompt access to
   */
  interpolatePrompt(promptStr, extraData = {}) {
    let attributeData = {};
    for (const [attr, value] of this.attributes) {
      attributeData[attr] = {
        current: this.getAttribute(attr),
        max: this.getMaxAttribute(attr),
        base: this.getBaseAttribute(attr),
      };
    }
    const promptData = Object.assign(attributeData, extraData);

    let matches = null;
    while (matches = promptStr.match(/%([a-z\.]+)%/)) {
      const token = matches[1];
      let promptValue = token.split('.').reduce((obj, index) => obj && obj[index], promptData);
      if (promptValue === null || promptValue === undefined) {
        promptValue = 'invalid-token';
      }
      promptStr = promptStr.replace(matches[0], promptValue);
    }

    return promptStr;
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
   * @param {string} id
   * @return {boolean}
   */
  hasPrompt(id) {
    return this.extraPrompts.has(id);
  }

  /**
   * Move the player to the given room, emitting events appropriately
   * @param {Room} nextRoom
   * @param {function} onMoved Function to run after the player is moved to the next room but before enter events are fired
   */
  moveTo(nextRoom, onMoved = _ => _) {
    if (this.room) {
      this.room.emit('playerLeave', this, nextRoom);
      this.room.removePlayer(this);
    }

    this.room = nextRoom;
    nextRoom.addPlayer(this);

    onMoved();

    nextRoom.emit('playerEnter', this);
    this.emit('enterRoom', nextRoom);
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
        room = state.RoomManager.startingRoom;
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
    this.inventory.hydrate(state, this);

    // Hydrate equipment
    // maybe refactor Equipment to be an object like Inventory?
    if (this.equipment && !(this.equipment instanceof Map)) {
      const eqDefs = this.equipment;
      this.equipment = new Map();
      for (const slot in eqDefs) {
        const itemDef = eqDefs[slot];
        try {
          let newItem = state.ItemFactory.create(state.AreaManager.getArea(itemDef.area), itemDef.entityReference);
          newItem.initializeInventory(itemDef.inventory);
          newItem.hydrate(state);
          state.ItemManager.add(newItem);
          newItem.isEquipped = true;
          this.equip(newItem);
        } catch (e) {
          Logger.error(e.message);
        }
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
      account: this.account.name,
      experience: this.experience,
      inventory: this.inventory && this.inventory.serialize(),
      metadata: this.metadata,
      password: this.password,
      playerClass: this.playerClass && this.playerClass.id,
      prompt: this.prompt,
      quests: this.questTracker.serialize(),
      role: this.role,
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
}

module.exports = Player;
