'use strict';

const fs = require('fs'),
    path = require('path'),
    util = require('util'),
    Data = require('./Data'),
    Area = require('./Area'),
    Command = require('./Command'),
    CommandType = require('./CommandType'),
    Item = require('./Item'),
    Npc = require('./Npc'),
    Room = require('./Room'),
    Helpfile = require('./Helpfile')
;

const srcPath = __dirname + '/';
const bundlesPath = srcPath + '../bundles/';

class BundleManager {
  constructor(state) {
    this.state = state;
  }

  /**
   * Load in all bundles
   */
  loadBundles() {
    util.log('LOAD: BUNDLES');

    const bundles = fs.readdirSync(bundlesPath);
    for (const bundle of bundles) {
      const bundlePath = bundlesPath + bundle;
      if (fs.statSync(bundlePath).isFile() || bundle === '.' || bundle === '..') {
        continue;
      }

      // only load bundles the user has configured to be loaded
      if (this.state.Config.get('bundles', []).indexOf(bundle) === -1) {
        continue;
      }

      this.loadBundle(bundle, bundlePath);
    }

    util.log('ENDLOAD: BUNDLES');
  }

  loadBundle(bundle, bundlePath) {
    // TODO: Use bundles.json file to see enabled bundles
    const paths = {
      areas: bundlePath + '/areas/',
      channels: bundlePath + '/channels.js',
      commands: bundlePath + '/commands/',
      help: bundlePath + '/help/',
      events: bundlePath + '/input-events/',
    };

    util.log(`LOAD: BUNDLE [${bundle}] START`);
    if (fs.existsSync(paths.commands)) {
      this.loadCommands(bundle, paths.commands);
    }

    if (fs.existsSync(paths.channels)) {
      this.loadChannels(bundle, paths.channels);
    }

    if (fs.existsSync(paths.help)) {
      this.loadHelp(bundle, paths.help);
    }

    if (fs.existsSync(paths.areas)) {
      this.loadAreas(bundle, paths.areas)

      // Distribution is done after all areas are loaded in case items use areas from each other
      console.log('Starting distribution...');
      this.state.AreaManager.distribute(this.state);
    }

    if (fs.existsSync(paths.events)) {
      this.loadEvents(bundle, paths.events)
    }
    util.log(`ENDLOAD: BUNDLE [${bundle}]`);
  }

  loadAreas(bundle, areasDir) {
    util.log(`\tLOAD: Areas...`);

    const dirs = fs.readdirSync(areasDir);

    for (const areaDir of dirs) {
      if (fs.statSync(areasDir + areaDir).isFile()) {
        continue;
      }

      const areaPath = areasDir + areaDir;
      const areaName = path.basename(areaDir);
      let area = this.loadArea(bundle, areaName, areaPath);
      this.state.AreaManager.addArea(area);
    }

    util.log(`\tENDLOAD: Areas`);
  }

  loadArea(bundle, areaName, areaPath) {
    var paths = {
      manifest: areaPath + '/manifest.yml',
      rooms: areaPath + '/rooms.yml',
      items: areaPath + '/items.yml',
      npcs: areaPath + '/npcs.yml',
    };

    const manifest = Data.parseFile(paths.manifest);

    let area = new Area(bundle, areaName, manifest);
    // TODO: Load listeners

    // load items
    if (fs.existsSync(paths.items)) {
      const items = this.loadItems(area, paths.items);
    }

    // load npcs
    if (fs.existsSync(paths.npcs)) {
      const npcs = this.loadNpcs(area, paths.npcs);
    }

    // load rooms
    if (fs.existsSync(paths.rooms)) {
      const rooms = this.loadRooms(area, paths.rooms);
    }

    return area;
  }

  loadItems(area, itemsFile) {
    util.log(`\tLOAD: AREA [${area.name}] Items...`);

    // parse the item files
    let items = Data.parseFile(itemsFile);

    // set the item definitions onto the factory
    items.forEach(item => {
      this.state.ItemFactory.setDefinition(area.name, item.id, item);
    });

    util.log(`\tENDLOAD: AREA [${area.name}] Items`);

    return items;
  }

  loadNpcs(area, npcsFile) {
    util.log(`\tLOAD: AREA [${area.name}] Npcs...`);

    // parse the npc files
    let npcs = Data.parseFile(npcsFile);

    // create and load the npcs
    npcs = npcs.map(npc => {
      this.state.MobFactory.setDefinition(area.name, npc.id, npc);
    });

    util.log(`\tENDLOAD: AREA [${area.name}] Npcs`);

    return npcs;
  }

  loadRooms(area, roomsFile) {
    util.log(`\tLOAD: AREA [${area.name}] Rooms...`);

    // parse the room files
    let rooms = Data.parseFile(roomsFile);

    // create and load the rooms
    rooms = rooms.map(room => new Room(area, room));
    rooms.forEach(room => {
      area.addRoom(room);
      this.state.RoomManager.addRoom(room)
    });

    util.log(`\tENDLOAD: AREA [${area.name}] Rooms`);

    return rooms;
  }

  loadCommands(bundle, commandsDir) {
    util.log(`\tLOAD: Commands...`);
    const files = fs.readdirSync(commandsDir);

    for (const commandFile of files) {
      const commandPath = commandsDir + commandFile;
      if (!fs.statSync(commandPath).isFile() || !commandFile.match(/js$/)) {
        continue;
      }

      const commandName = path.basename(commandFile, path.extname(commandFile));
      const injector = require(commandPath);
      let cmdImport = injector(srcPath);
      cmdImport.command = cmdImport.command(this.state);


      const command = new Command(
        bundle,
        commandName,
        cmdImport
      );

      this.state.CommandManager.add(command);
    }

    util.log(`\tENDLOAD: Commands...`);
  }

  loadChannels(bundle, channelsFile) {
    util.log(`\tLOAD: Channels...`);

    const injector = require(channelsFile);
    let channels = injector(srcPath);

    if (!Array.isArray(channels)) {
      channels = [channels];
    }

    channels.forEach(channel => {
      channel.bundle = bundle;
      this.state.ChannelManager.add(channel);
    });

    util.log(`\tENDLOAD: Channels...`);
  }

  loadHelp(bundle, helpDir) {
    util.log(`\tLOAD: Help...`);
    const files = fs.readdirSync(helpDir);

    for (const helpFile of files) {
      const helpPath = helpDir + helpFile;
      if (!fs.statSync(helpPath).isFile()) {
        continue;
      }

      const helpName = path.basename(helpFile, path.extname(helpFile));
      const def = Data.parseFile(helpPath);

      const hfile = new Helpfile(
        bundle,
        helpName,
        def
      );

      this.state.HelpManager.add(hfile);
    }

    util.log(`\tENDLOAD: Help...`);
  }

  loadEvents(bundle, eventsDir) {
    util.log(`\tLOAD: Events...`);
    const files = fs.readdirSync(eventsDir);

    for (const eventFile of files) {
      const eventPath = eventsDir + eventFile;
      if (!fs.statSync(eventPath).isFile() || !eventFile.match(/js$/)) {
        continue;
      }

      const eventName = path.basename(eventFile, path.extname(eventFile));
      const eventImport = require(eventPath)(srcPath);

      this.state.EventManager.addEvent(eventName, eventImport.event(this.state));
    }

    util.log(`\tENDLOAD: Events...`);
  }
}

module.exports = BundleManager;
