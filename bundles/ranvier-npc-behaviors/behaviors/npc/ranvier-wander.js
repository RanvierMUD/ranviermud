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
        if (this.isInCombat() || !this.room || !this.room.exits.length) {
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
        const randomRoom = state.RoomManager.getRoom(RandomUtil.fromArray(this.room.exits).roomId);

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
