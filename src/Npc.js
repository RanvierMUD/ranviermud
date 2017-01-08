'use strict';

const Character = require('./Character');
const uuid = require('node-uuid');

/**
 * @property {number} id   Area-relative id (vnum)
 * @property {Area}   area Area npc belongs to (not necessarily the area they're currently in)
 * @property {
 */
class Npc extends Character {
  constructor(area, data) {
    super(data);
    const validate = ['keywords', 'name', 'id'];

    for (const prop of validate) {
      if (!(prop in data)) {
        throw new ReferenceError(`NPC in area [${area.name}] missing required property [${prop}]`)
      }
    }

    this.area = data.area;
    this.keywords = data.keywords;
    this.description = data.description;
    this.id = data.id;
    this.uuid = data.uuid || uuid.v4();
    this.maxLoad = data.maxLoad;
  }
}

module.exports = Npc;
