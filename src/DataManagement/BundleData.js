'use strict';

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const chokidar = require('chokidar');
const EventEmitter = require('events');

const AreaData = require('./AreaData');

class BundleData {
  constructor(state, name, baseFolder) {
    this.baseAreasPath = path.join(baseFolder, 'areas');
    this.basePath = baseFolder;
    this.bundleName = name;
    this.areas = [];
    this.state = state;
  }

  load(reset) {
    if (reset) {
      this.areas = [];
    }

    this.loadAreas();

    return this;
  }

  loadAreas() {
    if (fs.existsSync(this.baseAreasPath)) {
      const areas = fs.readdirSync(this.baseAreasPath); 

      for (const area of areas) {
        if (fs.statSync(this.baseAreasPath).isFile()) {
          continue;
        }

        this.loadArea(area);
      }
    }
  }

  loadArea(area) {
    this.areas[area] = new AreaData(this.state, area, path.join(this.baseAreasPath, area)).load();
  }

  getArea (area) {
    return this.areas[area];
  }

  createArea(areaDefinition) {
    const {name, title, suggestedLevel} = areaDefinition;

    if (!name) {
      throw new Error('name is required');
    }

    if (!title) {
      throw new Error('title is required');
    }

    if (!suggestedLevel) {
      throw new Error('suggestedLevel is required');
    }

    if (!fs.existsSync(this.baseAreasPath)) {
      fs.mkdirSync(this.baseAreasPath);
    }

    if (fs.existsSync(path.join(this.baseAreasPath, name))) {
      throw new Error(`${name} already exists`);
    }

    fs.mkdirSync(path.join(this.baseAreasPath, name));

    let manifest = yaml.dump({
      title: title,
      suggestedLevel: suggestedLevel
    });

    fs.writeFileSync(path.join(this.baseAreasPath, name, 'manifest.yml'), manifest);
    fs.writeFileSync(path.join(this.baseAreasPath, name, 'items.yml'), '');
    fs.writeFileSync(path.join(this.baseAreasPath, name, 'rooms.yml'), '');
    fs.writeFileSync(path.join(this.baseAreasPath, name, 'npcs.yml'), '');

    this.areas[name] = new AreaData(this.state, name, path.join(this.baseAreasPath, name));

    return this.areas[name];
  }

  areaExists(areaName) {
    return fs.existsSync(path.join(this.baseAreasPath, areaName));
  }

  deleteArea(areaName) {
    if (!this.areaExists(areaName)) {
      throw new Error(`Area ${areaName} doesn't exist!`);
    }

    fs.removeSync(path.join(this.baseAreasPath, areaName));
    this.areas[areaName] = null;
  }
}

module.exports = BundleData;