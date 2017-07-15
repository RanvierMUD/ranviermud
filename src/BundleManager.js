/*jshint node: true, esversion: 6 */
'use strict';

const fs = require('fs'),
    path = require('path'),
    Data = require('./Data'),
    Area = require('./Area'),
    Command = require('./Command'),
    CommandType = require('./CommandType'),
    Item = require('./Item'),
    Npc = require('./Npc'),
    PlayerClass = require('./PlayerClass'),
    Room = require('./Room'),
    Skill = require('./Skill'),
    SkillType = require('./SkillType'),
    Helpfile = require('./Helpfile'),
    Logger = require('./Logger')
;

const srcPath = __dirname + '/';
const bundlesPath = srcPath + '../bundles/';

/**
 * Handles loading/parsing/initializing all bundles. AKA where the magic happens
 */
class BundleManager {
  /**
   * @param {GameState} state
   */
  constructor(state) {
    this.state = state;
  }

  /**
   * Load in all bundles
   */
  loadBundles() {
    Logger.verbose('LOAD: BUNDLES');

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

    Logger.verbose('ENDLOAD: BUNDLES');

    // Distribution is done after all areas are loaded in case items use areas from each other
    this.state.AreaManager.distribute(this.state);

    this.state.RoomManager.startingRoom = this.state.RoomManager.getRoom(this.state.Config.get('startingRoom'));
    Logger.verbose(`CONFIG: Starting Room [${this.state.RoomManager.startingRoom.entityReference}]`);
  }

  /**
   * @param {string} bundle Bundle name
   * @param {string} bundlePath Path to bundle directory
   */
  loadBundle(bundle, bundlePath) {
    const features = [
      { path: 'areas/', fn: 'loadAreas' },
      { path: 'behaviors/', fn: 'loadBehaviors' },
      { path: 'channels.js', fn: 'loadChannels' },
      { path: 'classes/', fn: 'loadClasses' },
      { path: 'commands/', fn: 'loadCommands' },
      { path: 'effects/', fn: 'loadEffects' },
      { path: 'help/', fn: 'loadHelp' },
      { path: 'input-events/', fn: 'loadInputEvents' },
      { path: 'player-events.js', fn: 'loadPlayerEvents' },
      { path: 'skills/', fn: 'loadSkills' },
    ];

    Logger.verbose(`LOAD: BUNDLE [\x1B[1;33m${bundle}\x1B[0m] START`);
    for (const feature of features) {
      const path = bundlePath + '/' + feature.path;
      if (fs.existsSync(path)) {
        this[feature.fn](bundle, path);
      }
    }

    Logger.verbose(`ENDLOAD: BUNDLE [\x1B[1;32m${bundle}\x1B[0m]`);
  }

  /**
   * Load/initialize player. See the {@link http://ranviermud.com/extending/input_events/|Player Event guide}
   * @param {string} bundle
   * @param {string} eventsFile event js file to load
   */
  loadPlayerEvents(bundle, eventsFile) {
    Logger.verbose(`\tLOAD: Player Events...`);

    const playerListeners = require(eventsFile)(srcPath).listeners;

    for (const eventName in playerListeners) {
      if (!playerListeners.hasOwnProperty(eventName)) {
        continue;
      }

      Logger.verbose(`\t\tEvent: ${eventName}`);
      this.state.PlayerManager.addListener(eventName, playerListeners[eventName](this.state));
    }

    Logger.verbose(`\tENDLOAD: Player Events...`);
  }

  /**
  * @param {string} bundle
  * @param {string} areasDir
  */
  loadAreas(bundle, areasDir) {
    Logger.verbose(`\tLOAD: Areas...`);

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

    Logger.verbose(`\tENDLOAD: Areas`);
  }

  /**
   * @param {string} bundle
   * @param {string} areaName
   * @param {string} areaPath
   */
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

  /**
   * Load all items from a given area.
   * @param {Area} area
   * @param {string} itemsFile File containing items to load
   */
  loadItems(area, itemsFile) {
    Logger.verbose(`\t\tLOAD: Items...`);

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

        Logger.verbose(`\t\t\tLoading Item Script [${entityRef}] ${item.script}`);
        this.loadEntityScript(this.state.ItemFactory, entityRef, scriptPath);
      }
    });

    Logger.verbose(`\t\tENDLOAD: Items`);

    return items;
  }

  /**
   * Load all npcs from a given area.
   * @param {Area} area
   * @param {string} npcsFile File containing npcs to load
   */
  loadNpcs(area, npcsFile) {
    Logger.verbose(`\t\tLOAD: Npcs...`);

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

        Logger.verbose(`\t\t\tLoading NPC Script [${entityRef}] ${npc.script}`);
        this.loadEntityScript(this.state.MobFactory, entityRef, scriptPath);
      }
    });

    Logger.verbose(`\t\tENDLOAD: Npcs`);

    return npcs;
  }

  /**
   * @param {EntityFactory} factory Instance of EntityFactory that the item/npc will be loaded into
   * @param {EntityReference} entityRef
   * @param {string} scriptPath
   */
  loadEntityScript(factory, entityRef, scriptPath) {
    const scriptListeners = require(scriptPath)(srcPath).listeners;

    for (const eventName in scriptListeners) {
      if (!scriptListeners.hasOwnProperty(eventName)) {
        continue;
      }

      Logger.verbose(`\t\t\t\tEvent: ${eventName}`);
      factory.addScriptListener(entityRef, eventName, scriptListeners[eventName](this.state));
    }
  }

  /**
   * @param {Area} area
   * @param {string} roomsFile
   */
  loadRooms(area, roomsFile) {
    Logger.verbose(`\t\tLOAD: Rooms...`);

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

        Logger.verbose(`\t\t\tLoading Room Script [${area.name}:${room.id}] ${room.script}`);
        // TODO: Maybe abstract this into its own method? Doesn't make much sense now
        // given that rooms are created only once so we can just attach the listeners
        // immediately
        const scriptListeners = require(scriptPath)(srcPath).listeners;
        for (const eventName in scriptListeners) {
          if (!scriptListeners.hasOwnProperty(eventName)) {
            continue;
          }

          Logger.verbose(`\t\t\t\tEvent: ${eventName}`);
          room.on(eventName, scriptListeners[eventName](this.state));
        }
      }
    });

    Logger.verbose(`\t\tENDLOAD: Rooms`);

    return rooms;
  }

  /**
   * @param {Area} area
   * @param {string} questsFile
   */
  loadQuests(area, questsFile) {
    Logger.verbose(`\t\tLOAD: Quests...`);

    const loader = require(questsFile);
    let quests = loader(srcPath);

    for (const id in quests) {
      Logger.verbose(`\t\t\tLoading Quest [${area.name}:${id}]`);
      this.state.QuestFactory.add(area.name, id, quests[id].config, quests[id].goals);
    }

    Logger.verbose(`\t\tENDLOAD: Quests...`);
  }

  /**
   * @param {string} bundle
   * @param {string} commandsDir
   */
  loadCommands(bundle, commandsDir) {
    Logger.verbose(`\tLOAD: Commands...`);
    const files = fs.readdirSync(commandsDir);

    for (const commandFile of files) {
      const commandPath = commandsDir + commandFile;
      if (!fs.statSync(commandPath).isFile() || !commandFile.match(/js$/)) {
        continue;
      }

      const commandName = path.basename(commandFile, path.extname(commandFile));
      const loader = require(commandPath);
      let cmdImport = loader(srcPath, bundlesPath);
      cmdImport.command = cmdImport.command(this.state);


      const command = new Command(
        bundle,
        commandName,
        cmdImport
      );

      this.state.CommandManager.add(command);
    }

    Logger.verbose(`\tENDLOAD: Commands...`);
  }

  /**
   * @param {string} bundle
   * @param {string} channelsFile
   */
  loadChannels(bundle, channelsFile) {
    Logger.verbose(`\tLOAD: Channels...`);

    const loader = require(channelsFile);
    let channels = loader(srcPath);

    if (!Array.isArray(channels)) {
      channels = [channels];
    }

    channels.forEach(channel => {
      channel.bundle = bundle;
      this.state.ChannelManager.add(channel);
    });

    Logger.verbose(`\tENDLOAD: Channels...`);
  }

  /**
   * @param {string} bundle
   * @param {string} helpDir
   */
  loadHelp(bundle, helpDir) {
    Logger.verbose(`\tLOAD: Help...`);
    const files = fs.readdirSync(helpDir);

    for (const helpFile of files) {
      const helpPath = helpDir + helpFile;
      if (!fs.statSync(helpPath).isFile()) {
        continue;
      }

      const helpName = path.basename(helpFile, path.extname(helpFile));
      const def = Data.parseFile(helpPath);

      let hfile = null;
      try {
        hfile = new Helpfile(
          bundle,
          helpName,
          def
        );
      } catch (e) {
        Logger.warn(`\t\t${e.message}`);
        continue;
      }

      this.state.HelpManager.add(hfile);
    }

    Logger.verbose(`\tENDLOAD: Help...`);
  }

  /**
   * @param {string} bundle
   * @param {string} inputEventsDir
   */
  loadInputEvents(bundle, inputEventsDir) {
    Logger.verbose(`\tLOAD: Events...`);
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

    Logger.verbose(`\tENDLOAD: Events...`);
  }

  /**
   * @param {string} bundle
   * @param {string} behaviorsDir
   */
  loadBehaviors(bundle, behaviorsDir) {
    Logger.verbose(`\tLOAD: Behaviors...`);

    function loadEntityBehaviors(type, manager, state) {
      let typeDir = behaviorsDir + type + '/';

      if (!fs.existsSync(typeDir)) {
        return;
      }

      Logger.verbose(`\t\tLOAD: BEHAVIORS [${type}]...`);
      const files = fs.readdirSync(typeDir);

      for (const behaviorFile of files) {
        const behaviorPath = typeDir + behaviorFile;
        if (!fs.statSync(behaviorPath).isFile() || !behaviorFile.match(/js$/)) {
          continue;
        }

        const behaviorName = path.basename(behaviorFile, path.extname(behaviorFile));
        Logger.verbose(`\t\t\tLOAD: BEHAVIORS [${type}] ${behaviorName}...`);
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

    Logger.verbose(`\tENDLOAD: Behaviors...`);
  }

  /**
   * @param {string} bundle
   * @param {string} effectsDir
   */
  loadEffects(bundle, effectsDir) {
    Logger.verbose(`\tLOAD: Effects...`);
    const files = fs.readdirSync(effectsDir);

    for (const effectFile of files) {
      const effectPath = effectsDir + effectFile;
      if (!fs.statSync(effectPath).isFile() || !effectFile.match(/js$/)) {
        continue;
      }

      const effectName = path.basename(effectFile, path.extname(effectFile));
      const loader = require(effectPath);

      Logger.verbose(`\t\t${effectName}`);
      this.state.EffectFactory.add(effectName, loader(srcPath));
    }

    Logger.verbose(`\tENDLOAD: Effects...`);
  }

  /**
   * @param {string} bundle
   * @param {string} skillsDir
   */
  loadSkills(bundle, skillsDir) {
    Logger.verbose(`\tLOAD: Skills...`);
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

      Logger.verbose(`\t\t${skillName}`);
      const skill = new Skill(skillName, skillImport, this.state);

      if (skill.type === SkillType.SKILL) {
        this.state.SkillManager.add(skill);
      } else {
        this.state.SpellManager.add(skill);
      }
    }

    Logger.verbose(`\tENDLOAD: Skills...`);
  }

  /**
   * @param {string} bundle
   * @param {string} classesDir
   */
  loadClasses(bundle, classesDir) {
    Logger.verbose(`\tLOAD: Classes...`);
    const files = fs.readdirSync(classesDir);

    for (const classFile of files) {
      const classPath = classesDir + classFile;
      if (!fs.statSync(classPath).isFile() || !classFile.match(/js$/)) {
        continue;
      }

      const className = path.basename(classFile, path.extname(classFile));
      const loader = require(classPath);
      let classImport = loader(srcPath);

      Logger.verbose(`\t\t${className}`);
      this.state.ClassManager.set(className, new PlayerClass(className, classImport));
    }

    Logger.verbose(`\tENDLOAD: Classes...`);
  }
}

module.exports = BundleManager;
