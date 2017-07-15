'use strict';

const EventEmitter = require('events');

/**
 * Representation of an in game area
 * See the {@link http://ranviermud.com/extending/areas/|Area guide} for documentation on how to
 * actually build areas.
 *
 * @property {string} bundle Bundle this area comes from
 * @property {string} name
 * @property {string} title
 * @property {Map<string, Room>} rooms Map of room id to Room
 * @property {Set<Npc>} npcs Active NPCs that originate from this area. Note: this is NPCs that
 *   _originate_ from this area. An NPC may not actually be in this area at any given moment.
 * @property {Object} info Area configuration
 * @property {Number} lastRespawnTick milliseconds since last respawn tick. See {@link Area#update}
 */
class Area extends EventEmitter {
  constructor(bundle, name, manifest) {
    super();
    this.bundle = bundle;
    this.name = name;
    this.title = manifest.title;
    this.rooms = new Map();
    this.npcs = new Set();
    this.info = Object.assign({
      // respawn interval in seconds
      respawnInterval: 60
    }, manifest.info || {});

    this.lastRespawnTick = -Infinity;

    this.on('updateTick', state => {
      this.update(state);
    });
  }

  /**
   * Get ranvier-root-relative path to this area
   * @return {string}
   */
  get areaPath() {
    return `${this.bundle}/areas/${this.name}`;
  }

  /**
   * @param {string} id Room id
   * @return {Room|undefined}
   */
  getRoomById(id) {
    return this.rooms.get(id);
  }

  /**
   * @param {Room} room
   */
  addRoom(room) {
    this.rooms.set(room.id, room);
  }

  /**
   * @param {Room} room
   */
  removeRoom(room) {
    this.rooms.delete(room.id);
  }

  /**
   * @param {Npc} npc
   */
  addNpc(npc) {
    this.npcs.add(npc);
  }

  /**
   * Removes an NPC from the game and frees its place in its originating room to allow it to respawn
   * @param {Npc} npc
   */
  removeNpc(npc) {
    if (npc.room) {
      npc.room.removeNpc(npc);
      npc.sourceRoom.removeSpawnedNpc(npc);
    }

    this.npcs.delete(npc);
  }

  /**
   * This method is automatically called every N milliseconds where N is defined in the
   * `setInterval` call to `GameState.AreaMAnager.tickAll` in the `ranvier` executable. It, in turn,
   * will fire the `updateTick` event on all its rooms.
   *
   * Also handles firing the `respawnTick` event on rooms to trigger respawn.
   * @see {@link Room.respawnTick}
   * 
   * @param {GameState} state
   */
  update(state) {
    for(const [id, room] of this.rooms) {
      room.emit('updateTick');
    }

    // handle respawn
    const sinceLastTick = Date.now() - this.lastRespawnTick;
    if (sinceLastTick >= this.info.respawnInterval * 1000) {
      this.lastRespawnTick = Date.now();
      for (const [id, room] of this.rooms) {
        room.emit('respawnTick', state);
      }
    }
  }
}

module.exports = Area;
