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
      behaviors: bundlePath + '/behaviors/',
      channels: bundlePath + '/channels.js',
      commands: bundlePath + '/commands/',
      help: bundlePath + '/help/',
      inputEvents: bundlePath + '/input-events/',
      playerEvents: bundlePath + '/player-events.js',
    };

    util.log(`LOAD: BUNDLE [${bundle}] START`);
    if (fs.existsSync(paths.commands)) {
      this.loadCommands(bundle, paths.commands);
    }

    if (fs.existsSync(paths.channels)) {
      this.loadChannels(bundle, paths.channels);
    }

    if (fs.existsSync(paths.behaviors)) {
      this.loadBehaviors(bundle, paths.behaviors);
    }

    if (fs.existsSync(paths.inputEvents)) {
      this.loadInputEvents(bundle, paths.inputEvents)
    }

    if (fs.existsSync(paths.playerEvents)) {
      this.loadPlayerEvents(bundle, paths.playerEvents);
    }

    if (fs.existsSync(paths.help)) {
      this.loadHelp(bundle, paths.help);
    }

    if (fs.existsSync(paths.areas)) {
      this.loadAreas(bundle, paths.areas)

      // Distribution is done after all areas are loaded in case items use areas from each other
      this.state.AreaManager.distribute(this.state);
    }

    util.log(`ENDLOAD: BUNDLE [${bundle}]`);
  }

  loadPlayerEvents(bundle, eventsFile) {
    util.log(`\tLOAD: Player Events...`);

    const playerListeners = require(eventsFile)(srcPath).listeners;

    for (const eventName in playerListeners) {
      if (!playerListeners.hasOwnProperty(eventName)) {
        continue;
      }

      util.log(`\t\tEvent: ${eventName}`);
      this.state.PlayerManager.addListener(eventName, playerListeners[eventName](this.state));
    }

    util.log(`\tENDLOAD: Player Events...`);
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
      quests: areaPath + '/quests.js',
    };

    const manifest = Data.parseFile(paths.manifest);

    let area = new Area(bundle, areaName, manifest);

    // load quests
    // Quests have to be loaded first so items/rooms/npcs that are questors have the quest defs available
    if (fs.existsSync(paths.quests)) {
      const rooms = this.loadQuests(area, paths.quests);
    }

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
    util.log(`\t\tLOAD: Items...`);

    // parse the item files
    let items = Data.parseFile(itemsFile);

    // set the item definitions onto the factory
    items.forEach(item => {
      this.state.ItemFactory.setDefinition(area.name, item.id, item);
      if (item.script) {
        const scriptPath = path.dirname(itemsFile) + '/scripts/items/' + item.script + '.js';
        if (!fs.existsSync(scriptPath)) {
          return;
        }

        util.log(`\t\t\tLoading Item Script [${area.name}:${item.id}] ${item.script}`);
        this.loadEntityScript(this.state.ItemFactory, area.name, item.id, scriptPath);
      }
    });

    util.log(`\t\tENDLOAD: Items`);

    return items;
  }

  loadNpcs(area, npcsFile) {
    util.log(`\t\tLOAD: Npcs...`);

    // parse the npc files
    let npcs = Data.parseFile(npcsFile);

    // create and load the npcs
    npcs = npcs.map(npc => {
      this.state.MobFactory.setDefinition(area.name, npc.id, npc);

      if (npc.quests) {
        // Update quest definitions with their questor
        for (const qid of npc.quests) {
          const quest = this.state.QuestFactory.get(qid);
          quest.config.npc = area.name + ':' + npc.id;
          this.state.QuestFactory.set(qid, quest);
        }
      }

      if (npc.script) {
        const scriptPath = path.dirname(npcsFile) + '/scripts/npcs/' + npc.script + '.js';
        if (!fs.existsSync(scriptPath)) {
          return;
        }

        util.log(`\t\t\tLoading NPC Script [${area.name}:${npc.id}] ${npc.script}`);
        this.loadEntityScript(this.state.MobFactory, area.name, npc.id, scriptPath);
      }
    });

    util.log(`\t\tENDLOAD: Npcs`);

    return npcs;
  }

  loadEntityScript(factory, areaName, entityId, scriptPath) {
    const scriptListeners = require(scriptPath)(srcPath).listeners;

    for (const eventName in scriptListeners) {
      if (!scriptListeners.hasOwnProperty(eventName)) {
        continue;
      }

      util.log(`\t\t\t\tEvent: ${eventName}`);
      factory.addScriptListener(areaName, entityId, eventName, scriptListeners[eventName](this.state));
    }
  }

  loadRooms(area, roomsFile) {
    util.log(`\t\tLOAD: Rooms...`);

    // parse the room files
    let rooms = Data.parseFile(roomsFile);

    // create and load the rooms
    rooms = rooms.map(room => new Room(area, room));
    rooms.forEach(room => {
      area.addRoom(room);
      this.state.RoomManager.addRoom(room)
      if (room.script) {
        const scriptPath = path.dirname(roomsFile) + '/scripts/rooms/' + room.script + '.js';
        if (!fs.existsSync(scriptPath)) {
          return;
        }

        util.log(`\t\t\tLoading Room Script [${area.name}:${room.id}] ${room.script}`);
        // TODO: Maybe abstract this into its own method? Doesn't make much sense now
        // given that rooms are created only once so we can just attach the listeners
        // immediately
        const scriptListeners = require(scriptPath)(srcPath).listeners;
        for (const eventName in scriptListeners) {
          if (!scriptListeners.hasOwnProperty(eventName)) {
            continue;
          }

          util.log(`\t\t\t\tEvent: ${eventName}`);
          room.on(eventName, scriptListeners[eventName](this.state));
        }
      }
    });

    util.log(`\t\tENDLOAD: Rooms`);

    return rooms;
  }

  loadQuests(area, questsFile) {
    util.log(`\t\tLOAD: Quests...`);

    const injector = require(questsFile);
    let quests = injector(srcPath);

    for (const id in quests) {
      util.log(`\t\t\tLoading Quest [${area.name}:${id}]`);
      this.state.QuestFactory.add(area.name, id, quests[id].type, quests[id].config);
    }

    util.log(`\t\tENDLOAD: Quests...`);
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

  loadInputEvents(bundle, inputEventsDir) {
    util.log(`\tLOAD: Events...`);
    const files = fs.readdirSync(inputEventsDir);

    for (const eventFile of files) {
      const eventPath = inputEventsDir + eventFile;
      if (!fs.statSync(eventPath).isFile() || !eventFile.match(/js$/)) {
        continue;
      }

      const eventName = path.basename(eventFile, path.extname(eventFile));
      const eventImport = require(eventPath)(srcPath);

      this.state.InputEventManager.add(eventName, eventImport.event(this.state));
    }

    util.log(`\tENDLOAD: Events...`);
  }

  loadBehaviors(bundle, behaviorsDir) {
    util.log(`\tLOAD: Behaviors...`);

    function loadEntityBehaviors(type, manager, state) {
      let typeDir = behaviorsDir + type + '/';

      if (!fs.existsSync(typeDir)) {
        return;
      }

      util.log(`\t\tLOAD: BEHAVIORS [${type}]...`);
      const files = fs.readdirSync(typeDir);

      for (const behaviorFile of files) {
        const behaviorPath = typeDir + behaviorFile;
        if (!fs.statSync(behaviorPath).isFile() || !behaviorFile.match(/js$/)) {
          continue;
        }

        const behaviorName = path.basename(behaviorFile, path.extname(behaviorFile));
        util.log(`\t\t\tLOAD: BEHAVIORS [${type}] ${behaviorName}...`);
        const behaviorListeners = require(behaviorPath)(srcPath).listeners;

        for (const eventName in behaviorListeners) {
          if (!behaviorListeners.hasOwnProperty(eventName)) {
            continue;
          }

          manager.addListener(behaviorName, eventName, behaviorListeners[eventName](state));
        }
      }
    }

    loadEntityBehaviors('npc', this.state.MobBehaviorManager, this.state);
    loadEntityBehaviors('item', this.state.ItemBehaviorManager, this.state);
    loadEntityBehaviors('room', this.state.RoomBehaviorManager, this.state);

    util.log(`\tENDLOAD: Behaviors...`);
  }
}

module.exports = BundleManager;
