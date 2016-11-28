'use strict';

//TODO: Refactor
var fs = require('fs'),
  util = require('util'),
  events = require('events'),
  Data = require('./data.js')
  .Data;

var rooms_dir = __dirname + '/../entities/areas/';
var l10n_dir = __dirname + '/../l10n/scripts/rooms/';
var rooms_scripts_dir = __dirname + '/../scripts/rooms/';

var Rooms = function() {
  var self = this;
  self.areas = {};
  self.rooms = {};

  self.load = function(verbose, callback) {
    verbose = verbose || false;
    var log = function(message) {
      if (verbose) util.log(message);
    };
    var debug = function(message) {
      if (verbose) util.debug(message);
    };

    // Load all the areas into th game
    fs.readdir(rooms_dir, function(err, files) {
      if (err) {
        log('For some reason reading the entities directory failed for areas' + err);
        return;
      }

      for (let i in files) {
        var file = rooms_dir + files[i];
        if (!fs.statSync(file).isDirectory()) continue;

        log("\tExamining area directory - " + file);
        var rooms = fs.readdirSync(file);

        // Check for an area manifest
        var hasManifest = false;
        for (let j in rooms) {
          if (rooms[j].match(/manifest.yml/)) {
            hasManifest = true;
            break;
          }
        }

        if (!hasManifest) {
          log("\tFailed to load area - " + file + ' - No manifest');
          return;
        }

        try {
          var manifest = require('js-yaml')
            .load(fs.readFileSync(file + '/manifest.yml')
              .toString('utf8'));
        } catch (e) {
          log("\tError loading area manifest for " + file + ' - ' + e.message);
          return;
        }

        var areacount = 1;
        for (var area in manifest) {
          if (!areacount) {
            log("\tFound more than one area definition in the manifest for " + file + ' ... skipping');
            break;
          }

          if (!('title' in manifest[area])) {
            log("\tFailed loading area " + area + ', it has no title.');
            break;

          }
          self.areas[area] = manifest[area];
          log("\tLoading area " + self.areas[area].title + '...');
          areacount--;
        }

        // Load any room files
        for (let j in rooms) {
          var room_file = file + '/' + rooms[j];

          //skip the manifest or any directories
          if (room_file.match(/manifest/)) continue;
          if (!fs.statSync(room_file).isFile()) continue;
          if (!room_file.match(/yml$/)) continue;

          // parse the room files
          try {
            var room_def = require('js-yaml')
              .load(fs.readFileSync(room_file).toString('utf8'));
          } catch (e) {
            log("\t\tError loading room - " + room_file + ' - ' + e.message);
            continue;
          }

          // create and load the rooms
          for (var vnum in room_def) {
            var room = room_def[vnum];
            var validate = ['title', 'description', 'location'];

            var err = false;
            for (var v in validate) {
              if (!(validate[v] in room)) {
                log("\t\tError loading room in file " + room.location + ' - no ' + validate[v] + ' specified');
                err = true;
                break;
              }
            }

            if (err) { continue;}

            log("\t\tLoaded room " + room.location + '...');
            room.area = room.area || area
            room.filename = room_file;
            room.file_index = vnum;
            room = new Room(room);
            self.addRoom(room);
          }
        }
      }

      if (callback) {
        callback();
      }
    });
  };

  self.addRoom = room => self.rooms[room.getLocation()] = room;

  /**
   * Get a room at a specific location
   * @param int location
   * @return Room
   */
  self.getAt = function(location) {
    return location in self.rooms ? self.rooms[location] : false;
  };

  /**
   * Filter rooms and return array of those meeting the criteria.
   * @param condition
   * @return array of rooms
   */
  self.filter = condition => {
    let _rooms = [];
    for (let room in self.rooms) {
      _rooms.push(room);
    }
    return _rooms.filter(condition) || [];
  };

  /**
   * Get an area
   * @param string area
   * @return object
   */
  self.getArea = function(area) {
    return area in self.areas ? self.areas[area] : false;
  };

}

var Room = function Room(config) {
  var self = this;

  self.title = '';
  self.description = '';
  self.exits = [];
  self.location = null;
  self.biome = '';
  self.area = null;

  // these are only set after load, not on construction and is an array of vnums
  self.items = [];
  self.npcs = [];
  self.filename = '';
  self.file_index = null;


  self.init = function(config) {
    self.title       = config.title;
    self.biome       = config.biome      || 'indoors';
    self.description = config.description;
    self.short_desc  = config.short_desc || config.description;
    self.dark_desc   = config.dark_desc  || config.description;
    self.location    = config.location;
    self.exits       = config.exits      || [];
    self.area        = config.area;
    self.filename    = config.filename;
    self.file_index  = config.file_index;

    self.exits = self.exits.map(exit => {
      if (exit.door && !exit.door.open) { exit.door.open = false; }
      else if (exit.door) { exit.door.open = true; }
      return exit;
    });

    Data.loadListeners(config, l10n_dir, rooms_scripts_dir, Data.loadBehaviors(config, 'rooms/', self));
  };

  self.getLocation = function() {
    return self.location;
  };
  self.getArea = function() {
    return self.area;
  };
  self.getExits = function() {
    return self.exits;
  };
  self.getItems = function() {
    return self.items;
  };
  self.getNpcs = function() {
    return self.npcs;
  };

  self.getBiome = () => self.biome;

  /**
   * Get the description, localized if possible
   * @param string locale
   * @return string
   */
  self.getDescription = function(locale) {
    return typeof self.description === 'string' ?
      self.description :
      (locale in self.description ? self.description[locale] : 'UNTRANSLATED - Contact an admin');
  };

  self.getShortDesc = function(locale) {
    return typeof self.short_desc === 'string' ?
      self.short_desc :
      (locale in self.short_desc ?
        self.short_desc[locale] :
        self.getDescription(locale));
  };

  self.getDarkDesc = function(locale) {
    return typeof self.dark_desc === 'string' ?
      self.dark_desc :
      (locale in self.dark_desc ?
        self.dark_desc[locale] :
        self.getShortDesc(locale));
  }

  /**
   * Get the title, localized if possible
   * @param string locale
   * @return string
   */
  self.getTitle = function(locale) {
    return typeof self.title === 'string' ?
      self.title :
      (locale in self.title ? self.title[locale] : 'UNTRANSLATED - Contact an admin');
  }

  /**
   * Get the leave message for an exit, localized if possible
   * @param object exit
   * @param string locale
   * @return string
   */
  self.getLeaveMessage = function(exit, locale) {
    return typeof exit.leave_message === 'string' ?
      self.leave_message :
      (locale in self.leave_message ? self.leave_message[locale] : 'UNTRANSLATED - Contact an admin');
  };

  /**
   * Add an item to the quicklookup array for items
   * @param string uid
   */
  self.addItem = function(item) {
    self.items.push(item.getUuid());
  };

  /**
   * Remove an item from the room
   * @param string uid
   */
  self.removeItem = function(item) {
    const itemId = item.getUuid();
    self.items = self.items.filter(function(uid) {
      return itemId !== uid;
    });
  };

  /**
   * Add an npc to the quicklookup array for npcs
   * @param string uid
   */
  self.addNpc = function(uid) {
    self.npcs.push(uid)
  };

  /**
   * Remove an npc from the room
   * @param string uid
   */
  self.removeNpc = function(uid) {
    self.npcs = self.npcs.filter(i => i !== uid);
  };

  /**
   * Check to see if an npc is in the room
   * @param string uid
   * @return boolean
   */
  self.hasNpc = function(uid) {
    return self.npcs.some(i => i === uid);
  };

  /**
   * Check to see if an item is in the room
   * @param string uid
   * @return boolean
   */
  self.hasItem = function(item) {
    const uid = item.getUuid();
    return self.items.some(id => id === uid);
  };

  /**
   * Flatten into a simple structure
   * @return object
   */
  self.flatten = function() {
    return {
      title: self.getTitle('en'),
      description: self.getDescription('en'),
      exits: self.exits,
      location: self.location,
      area: self.area,
      short_desc: self.short_desc,
      dark_desc: self.dark_desc
    };
  };

  /**
   * Get a full object of the room
   * @return object
   */
  self.stringify = function() {
    return {
      title: self.title,
      description: self.description,
      exits: self.exits,
      location: self.location,
      area: self.area,
      short_desc: self.short_desc,
      dark_desc: self.dark_desc
    };
  };

  self.init(config);
};
util.inherits(Room, events.EventEmitter);

exports.Rooms = Rooms;
exports.Room = Room;
