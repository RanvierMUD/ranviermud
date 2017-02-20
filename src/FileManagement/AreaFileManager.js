'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

class AreaFileManager {
  constructor(baseDir, bundle, area) {
    if (!bundle) {
      throw new Error(`Bundle required`);
    }

    if (!area) {
      throw new Error(`Area required`);
    }

    if (!baseDir) {
      throw new Error('Base directory required');
    }

    this.filteredFiles = ['manifest.yml', 'quests.js'];

    this.bundle = bundle;
    this.area = area;

    this.basePath = path.join(baseDir, 'bundles', bundle, 'areas', area);
    this.files = [];
  }

  load() { 
    this.files = fs.readdirSync(this.basePath);

    this.files.forEach((file, index) => {
      let contents = fs.readFileSync(path.join(this.basePath, file)).toString('utf8');
      this.files[file.split('.')[0]] = yaml.load(contents);
    });
  }

  getEntity(type, id) {
    let obj = this.files[type].filter(x => x.id == id)[0];

    if (!obj) {
      throw new Error(`${type} with id = ${id} not found`);
    }

    return obj;
  }

  put(type, newObject) {
    let existingObject;
    try {
      existingObject = this.getEntity(type, newObject.id);
    } catch (err) {
      //doesn't exist yet, continue on
    }

    if (existingObject) {
      Object.assign(existingObject, newObject);
    } else {
      this.files[type][this.files[type].length] = newObject;
    }
  }


}

module.exports = AreaFileManager;