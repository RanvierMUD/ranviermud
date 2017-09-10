/**
 * IF you absolutely need to iterate over a floor in a tight (nested) loop you
 * should use the low/high properties like so.
 *
 * ```javascript
 * const floor = area.map.get(2);
 * for (let x = floor.lowX; x <= floor.highX; x++) {
 *  for (let y = floor.lowY; y <= floor.highY; y++) {
 *    const room = floor.getRoom(x, y);
 *
 *    if (!room) {
 *      continue;
 *    }
 *  }
 * }
 * ```
 *
 * Note the `<=` to avoid fenceposting the loop
 *
 * @property {number} lowX The lowest x value
 * @property {number} highX The highest x value
 * @property {number} lowY The lowest y value
 * @property {number} highY The highest y value
 * @property {number} z This floor's z index
 */
class AreaFloor {
  constructor(z) {
    this.z = z;
    this.lowX = this.highX = this.lowY = this.highY = 0;
    this.map = [];
  }

  addRoom(x, y, room) {
    if (!room) {
      throw new Error('Invalid room given to AreaFloor.addRoom');
    }

    if (this.getRoom(x, y)) {
      throw new Error(`AreaFloor.addRoom: trying to add room at filled coordinates: ${x}, ${y}`);
    }

    if (x < this.lowX) {
      this.lowX = x;
    } else if (x > this.highX) {
      this.highX = x;
    }

    if (y < this.lowY) {
      this.lowY = y;
    } else if (y > this.highY) {
      this.highY = y;
    }

    if (!Array.isArray(this.map[x])) {
      this.map[x] = [];
    }

    this.map[x][y] = room;
  }

  /**
   * @return {Room|boolean}
   */
  getRoom(x, y) {
    return this.map[x] && this.map[x][y];
  }

  removeRoom(x, y) {
    if (!this.map[x] || !this.map[x][y]) {
      throw new Error('AreaFloor.removeRoom: trying to remove non-existent room');
    }

    this.map[x][y] = undefined;
  }
}

module.exports = AreaFloor;
