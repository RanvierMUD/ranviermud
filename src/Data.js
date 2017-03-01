'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const dataPath = __dirname + '/../data/';

module.exports = {
  parseFile: function (filepath) {
    if (!fs.existsSync(filepath)) {
      throw new Error(`File [${filepath}] does not exist!`);
    }

    const contents = fs.readFileSync(filepath).toString('utf8');
    const parsers = {
      '.yml': yaml.load,
      '.yaml': yaml.load,
      '.json': JSON.parse,
    };

    const ext = path.extname(filepath);
    if (!(ext in parsers)) {
      throw new Error(`File [${filepath}] does not have a valid parser!`);
    }

    return parsers[ext](contents);
  },

  saveFile: function(filepath, data, callback) {
    if (!fs.existsSync(filepath)) {
      throw new Error(`File [${filepath}] does not exist!`);
    }

    const serializers = {
      '.yml': yaml.safeDump,
      '.yaml': yaml.safeDump,
      '.json': function(data) {
        //Make it prettttty
        return JSON.stringify(data, null, 2);
      }
    };

    const ext = path.extname(filepath);
    if (!(ext in serializers)) {
      throw new Error(`File [${filepath}] does not have a valid deserializer!`);
    }

    var dataToWrite = serializers[ext](data);

    fs.writeFileSync(filepath, dataToWrite, 'utf8');

    if (callback) {
      callback();
    }

  },

  load: function (type, id) {
    return this.parseFile(this.getDataFilePath(type, id));
  },

  save: function (type, id, data, callback) {
    fs.writeFileSync(this.getDataFilePath(type, id), JSON.stringify(data, null, 2), 'utf8');
    if (callback) {
      callback();
    }
  },

  exists: function (type, id) {
    return fs.existsSync(this.getDataFilePath(type, id));
  },

  getDataFilePath: function (type, id) {
    switch (type) {
      case 'player': {
        return dataPath + `/player/${id}.json`;
      }
      case 'account': {
        return dataPath + `/account/${id}.json`;
      }
    }
  },

  /**
   * load the MOTD for the intro screen
   * @return string
   */
  loadMotd: () => {
    var motd = fs.readFileSync(dataPath + 'motd').toString('utf8');
    return motd;
  }
};
