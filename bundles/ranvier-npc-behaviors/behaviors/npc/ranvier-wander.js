'use strict';

/**
 * An example behavior that causes an NPC to wander around an area when not in combat
 * Options:
 *   areaRestricted: boolean, true to restrict the NPC's wandering to his home area. Default: false
 *   restrictTo: Array<EntityReference>, list of room entity references to restrict the NPC to. For
 *     example if you want them to wander along a set path
 *   interval: number, delay in seconds between room movements. Default: 20
 */
module.exports = srcPath => {
  const RandomUtil = require(srcPath + 'RandomUtil');
  const Logger = require(srcPath + 'Logger');

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
          interval: 20
        }, config);

        if (!this._lastWanderTime) {
          this._lastWanderTime = Date.now();
        }

        if (Date.now() - this._lastWanderTime < config.interval * 1000) {
          return;
        }

        this._lastWanderTime = Date.now();
        let possibleRooms = new Set(this.room.exits.map(exit => exit.roomId));
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
              possibleRooms.add(room.entityReference);
            }
          }
        }

        const roomId = RandomUtil.fromArray([...possibleRooms]);
        const randomRoom = state.RoomManager.getRoom(roomId);

        if (
          (config.restrictTo && !config.restrictTo.includes(randomRoom.entityReference)) ||
          (config.areaRestricted && randomRoom.area !== this.area) ||
          !randomRoom
        ) {
          return;
        }

        Logger.verbose(`NPC [${this.uuid}] wandering from ${this.room.entityReference} to ${randomRoom.entityReference}.`);
        this.moveTo(randomRoom);
      }
    }
  };
};
