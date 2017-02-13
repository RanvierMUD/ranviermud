/*jshint node: true, esversion: 6 */
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
    Skill = require('./Skill'),
    SkillType = require('./SkillType'),
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

    // Distribution is done after all areas are loaded in case items use areas from each other
    this.state.AreaManager.distribute(this.state);

    this.state.RoomManager.startingRoom = this.state.RoomManager.getRoom(this.state.Config.get('startingRoom'));
    util.log(`CONFIG: Starting Room [${this.state.RoomManager.startingRoom.entityReference}]`);
  }

  loadBundle(bundle, bundlePath) {
    const features = [
      { path: 'areas/', fn: 'loadAreas' },
      { path: 'behaviors/', fn: 'loadBehaviors' },
      { path: 'channels.js', fn: 'loadChannels' },
      { path: 'commands/', fn: 'loadCommands' },
      { path: 'effects/', fn: 'loadEffects' },
      { path: 'help/', fn: 'loadHelp' },
      { path: 'input-events/', fn: 'loadInputEvents' },
      { path: 'player-events.js', fn: 'loadPlayerEvents' },
      { path: 'skills/', fn: 'loadSkills' },
    ];

    util.log(`LOAD: BUNDLE [${bundle}] START`);
    for (const feature of features) {
      const path = bundlePath + '/' + feature.path;
      if (fs.existsSync(path)) {
        this[feature.fn](bundle, path);
      }
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
      const entityRef = this.state.ItemFactory.createEntityRef(area.name, item.id);
      this.state.ItemFactory.setDefinition(entityRef, item);
      if (item.script) {
        const scriptPath = path.dirname(itemsFile) + '/scripts/items/' + item.script + '.js';
        if (!fs.existsSync(scriptPath)) {
          return;
        }

        util.log(`\t\t\tLoading Item Script [${entityRef}] ${item.script}`);
        this.loadEntityScript(this.state.ItemFactory, entityRef, scriptPath);
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
      const entityRef = this.state.MobFactory.createEntityRef(area.name, npc.id);
      this.state.MobFactory.setDefinition(entityRef, npc);

      if (npc.quests) {
        // Update quest definitions with their questor
        for (const qid of npc.quests) {
          const quest = this.state.QuestFactory.get(qid);
          quest.config.npc = entityRef;
          this.state.QuestFactory.set(qid, quest);
        }
      }

      if (npc.script) {
        const scriptPath = path.dirname(npcsFile) + '/scripts/npcs/' + npc.script + '.js';
        if (!fs.existsSync(scriptPath)) {
          return;
        }

        util.log(`\t\t\tLoading NPC Script [${entityRef}] ${npc.script}`);
        this.loadEntityScript(this.state.MobFactory, entityRef, scriptPath);
      }
    });

    util.log(`\t\tENDLOAD: Npcs`);

    return npcs;
  }

  loadEntityScript(factory, entityRef, scriptPath) {
    const scriptListeners = require(scriptPath)(srcPath).listeners;

    for (const eventName in scriptListeners) {
      if (!scriptListeners.hasOwnProperty(eventName)) {
        continue;
      }

      util.log(`\t\t\t\tEvent: ${eventName}`);
      factory.addScriptListener(entityRef, eventName, scriptListeners[eventName](this.state));
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
      this.state.RoomManager.addRoom(room);
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

    const loader = require(questsFile);
    let quests = loader(srcPath);

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
      const loader = require(commandPath);
      let cmdImport = loader(srcPath);
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

    const loader = require(channelsFile);
    let channels = loader(srcPath);

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

  loadEffects(bundle, effectsDir) {
    util.log(`\tLOAD: Effects...`);
    const files = fs.readdirSync(effectsDir);

    for (const effectFile of files) {
      const effectPath = effectsDir + effectFile;
      if (!fs.statSync(effectPath).isFile() || !effectFile.match(/js$/)) {
        continue;
      }

      const effectName = path.basename(effectFile, path.extname(effectFile));
      const loader = require(effectPath);

      util.log(`\t\t${effectName}`);
      this.state.EffectFactory.add(effectName, loader(srcPath));
    }

    util.log(`\tENDLOAD: Effects...`);
  }

  loadSkills(bundle, skillsDir) {
    util.log(`\tLOAD: Skills...`);
    const files = fs.readdirSync(skillsDir);

    for (const skillFile of files) {
      const skillPath = skillsDir + skillFile;
      if (!fs.statSync(skillPath).isFile() || !skillFile.match(/js$/)) {
        continue;
      }

      const skillName = path.basename(skillFile, path.extname(skillFile));
      const loader = require(skillPath);
      let skillImport = loader(srcPath);
      if (skillImport.run) {
        skillImport.run = skillImport.run(this.state);
      }

      util.log(`\t\t${skillName}`);
      const skill = new Skill(skillName, skillImport, this.state);

      if (skill.type === SkillType.SKILL) {
        this.state.SkillManager.add(skill);
      } else {
        this.state.SpellManager.add(skill);
      }
    }

    util.log(`\tENDLOAD: Skills...`);
  }
}

module.exports = BundleManager;
