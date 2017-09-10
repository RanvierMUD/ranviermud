'use strict';

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const chokidar = require('chokidar');
const EventEmitter = require('events');

class AreaData extends EventEmitter {
  constructor(state, name, baseFolder) {
    super();
    this.areaName = name;
    this.basePath = baseFolder;
    this.state = state;
    this.items = [];
    this.npcs = [];
    this.rooms = [];
    this.manifest = {};

  }

  load(reset) {
    if (reset) {
      this.items = [];
      this.npcs = [];
      this.rooms = [];
    }

    this.loadManifest();
    this.loadNpcs();
    this.loadItems();
    this.loadRooms();

    return this;
  }

  loadNpcs() {
    let npcYaml;

    try {
      npcYaml = fs.readFileSync(path.join(this.basePath, 'npcs.yml'));
    } catch (err) {
      return new Error('Error loading NPC yaml');
    }

    this.npcs = yaml.load(npcYaml);
  }

  loadItems() {
    let itemsYaml;

    try {
      itemsYaml = fs.readFileSync(path.join(this.basePath, 'items.yml'));
    } catch (err) {
      return new Error('Error loading Items yaml');
    }

    this.items = yaml.load(itemsYaml);
  }

  loadRooms() {
    let roomsYaml;

    try {
      roomsYaml = fs.readFileSync(path.join(this.basePath, 'rooms.yml'));
    } catch (err) {
      return new Error('Error loading Rooms yaml');
    }

    this.rooms = yaml.load(roomsYaml);
  }

  loadManifest() {
    let manifestYaml;

    try {
      manifestYaml = fs.readFileSync(path.join(this.basePath, 'manifest.yml'));
    } catch (err) {
      return new Error('Error loading Manifest yaml');
    }

    this.manifest = yaml.load(manifestYaml);
  }

  getNpc (id) {
    return this.npcs.filter(x => x.id == id)[0];
  }

  putNpc(npc) {
    let existingNpc = this.getNpc(npc.id);

    if (existingNpc) {
      Object.assign(existingNpc, npc);
    } else {
      this.npcs[this.npcs.length] = npc;
    }

    fs.writeFileSync(path.join(this.basePath, 'npcs.yml'), yaml.dump(this.npcs));
  }

  getItem (id) {
    return this.items.filter(x => x.id == id)[0];
  }

  putItem (item) {
    let existingItem = this.getItem(item.id);

    if (existingItem) {
      Object.assign(existingItem, item);
    } else {
      this.items[this.items.length] = item;
    }

    fs.writeFileSync(path.join(this.basePath, 'items.yml'), yaml.dump(this.items));
  }

  getRoom (id) {
    return this.rooms.filter(x => x.id == id)[0];
  }

  putRoom (room) {
    let existingRoom = this.getRoom(room.id);

    if (existingRoom) {
      Object.assign(existingRoom, room);
    } else {
      this.rooms[this.rooms.length] = room;
    }

    fs.writeFileSync(path.join(this.basePath, 'rooms.yml'), yaml.dump(this.rooms));
  }

}

module.exports = AreaData;