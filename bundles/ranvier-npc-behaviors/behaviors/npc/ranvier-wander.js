'use strict';

/**
 * An example behavior that causes an NPC to wander around an area when not in combat
 * Options:
 *   areaRestricted: boolean, true to restrict the NPC's wandering to his home area. Default: false
 *   restrictTo: Array<EntityReference>, list of room entity references to restrict the NPC to. For
 *     example if you want them to wander along a set path
 *   interval: number, delay in seconds between room movements. Default: 20
 */
module.exports = () => {
  const Ranvier = require('ranvier');
  const RandomUtil = Ranvier.RandomUtil;
  const Broadcast = Ranvier.Broadcast;
  const Logger = Ranvier.Logger;

  return {
    listeners: {
      updateTick: state => function (config) {
        if (this.isInCombat() || !this.room) {
          return;
        }

        if (config === true) {
          config = {};
        }

        config = Object.assign({
          areaRestricted: false,
          restrictTo: null,
          interval: 20,
        }, config);

        if (!this._lastWanderTime) {
          this._lastWanderTime = Date.now();
        }

        if (Date.now() - this._lastWanderTime < config.interval * 1000) {
          return;
        }

        this._lastWanderTime = Date.now();
        let possibleRooms = {};
        for (const possibleExit of this.room.exits) {
          possibleRooms[possibleExit.direction] = possibleExit.roomId;
        }

        const coords = this.room.coordinates;
        if (coords) {
          // find exits from coordinates
          const area = this.room.area;
          const directions = {
            north: [0, 1, 0],
            south: [0, -1, 0],
            east: [1, 0, 0],
            west: [-1, 0, 0],
            up: [0, 0, 1],
            down: [0, 0, -1],
          };

          for (const [dir, diff] of Object.entries(directions)) {
            const room = area.getRoomAtCoordinates(coords.x + diff[0], coords.y + diff[1], coords.z + diff[2]);
            if (room) {
              possibleRooms[dir] = room.entityReference;
            }
          }
        }

        const [direction, roomId] = RandomUtil.fromArray(Object.entries(possibleRooms));
        const randomRoom = state.RoomManager.getRoom(roomId);

        const door = this.room.getDoor(randomRoom) || randomRoom.getDoor(this.room);
        if (randomRoom && door && (door.locked || door.closed)) {
          // maybe a possible feature where it could be configured that they can open doors
          // or even if they have the key they can unlock the doors
          Logger.verbose(`NPC [${this.uuid}] wander blocked by door.`);
          return;
        }

        if (
          !randomRoom ||
          (config.restrictTo && !config.restrictTo.includes(randomRoom.entityReference)) ||
          (config.areaRestricted && randomRoom.area !== this.area)
        ) {
          return;
        }

        Logger.verbose(`NPC [${this.uuid}] wandering from ${this.room.entityReference} to ${randomRoom.entityReference}.`);
        Broadcast.sayAt(this.room, `${this.name} wanders ${direction}.`);
        this.moveTo(randomRoom);
      }
    }
  };
};
