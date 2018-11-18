#!/usr/bin/env node
'use strict';

/**
 * Main file, use this to run the server:
 * node ranvier [options]
 *
 * Options:
 *   -v Verbose loggin
 *   --port Port to listen on
 *   --locale Locale to act as the default
 *   --save Minutes between autosave
 *   --respawn Minutes between respawn
 */


/* NPM Modules */
const semver = require('semver');
const net = require('net');
const commander = require('commander');
const argv = require('optimist').argv;

// for dev clone the github:ranviermud/core repo, and run npm link in that folder, then come
// back to the ranviermud repo and run npm link ranvier
const Ranvier = require('ranvier');
const Config = Ranvier.Config;

// Package.json for versioning
const pkg = require('./package.json');

if (!semver.satisfies(process.version, pkg.engines.node)) {
  throw new Error(
    `Ranvier's core engine requires Node version ${pkg.engines.node},
    you are currently running Node ${process.version}.`
  );
}

// Wrapper for ranvier.json
Ranvier.Data.setDataPath(__dirname + '/data/');
Config.load(require('./ranvier.json'));

// cmdline options
commander
  .version(pkg.version)
  .option('-s, --save [time]', 'Number of seconds between auto-save ticks [10]', 10)
  .option('-r, --respawn [time]', 'Number of minutes between respawn ticks [120]', 120)
  .option('-p, --port [portNumber]', 'Port to host the server [23]', Ranvier.Config.get('port', 23))
  .option('-v, --verbose', 'Verbose console logging.', true)
  .option('-e, --prettyErrors', 'Pretty-print formatting for error stack traces.', false)
  .parse(process.argv);

// Set debug variable and encoding.
// 'net' by default to help find possible server errors.
process.env.NODE_DEBUG = 'net';
process.stdin.setEncoding('utf8');

const Logger = Ranvier.Logger;
const logfile = Ranvier.Config.get('logfile');
if (logfile) {
  Logger.setFileLogging(`${__dirname}/log/${logfile}`);
}

if (commander.prettyErrors) {
  Logger.enablePrettyErrors();
}

// Set logging level based on CLI option or environment variable.
const logLevel = commander.verbose ?
  'verbose' :
  process.env.LOG_LEVEL || Config.get('logLevel') || 'debug';
Logger.setLevel(logLevel);


// Global state object, server instance and configurable intervals.
let GameState = {};
let saveInterval, tickInterval, playerTickInterval;

/**
 * Do the dirty work
 */
function init(restartServer) {
  Logger.log("START - Loading entities");
  restartServer = typeof restartServer === 'undefined' ? true : restartServer;

  GameState = {
    AccountManager: new Ranvier.AccountManager(),
    AreaManager: new Ranvier.AreaManager(),
    AttributeFactory: new Ranvier.AttributeFactory(),
    ChannelManager: new Ranvier.ChannelManager(),
    ClassManager: new Ranvier.ClassManager(), // player class manager
    CommandManager: new Ranvier.CommandManager(),
    Config, // All global server settings like default respawn time, save interval, port, what bundles to load, etc.
    EffectFactory: new Ranvier.EffectFactory(),
    HelpManager: new Ranvier.HelpManager(),
    InputEventManager: new Ranvier.EventManager(),
    ItemBehaviorManager: new Ranvier.BehaviorManager(),
    ItemFactory: new Ranvier.ItemFactory(),
    ItemManager: new Ranvier.ItemManager(),
    MobBehaviorManager: new Ranvier.BehaviorManager(),
    MobFactory: new Ranvier.MobFactory(),
    MobManager: new Ranvier.MobManager(),
    PartyManager: new Ranvier.PartyManager(),
    PlayerManager: new Ranvier.PlayerManager(),
    QuestFactory: new Ranvier.QuestFactory(),
    QuestGoalManager: new Ranvier.QuestGoalManager(),
    QuestRewardManager: new Ranvier.QuestRewardManager(),
    RoomBehaviorManager: new Ranvier.BehaviorManager(),
    RoomManager: new Ranvier.RoomManager(),
    SkillManager: new Ranvier.SkillManager(),
    SpellManager: new Ranvier.SkillManager(),
    ServerEventManager: new Ranvier.EventManager(),
    GameServer: new Ranvier.GameServer(),
    DataLoader: Ranvier.Data,
    Config,
  };

  // Setup bundlemanager
  const BundleManager = new Ranvier.BundleManager(__dirname + '/bundles/', GameState);
  GameState.BundleManager = BundleManager;
  BundleManager.loadBundles();
  GameState.ServerEventManager.attach(GameState.GameServer);

  if (restartServer) {
    Logger.log("START - Starting server");
    GameState.GameServer.startup(commander);

    // Save every 10 minutes by default.
    Logger.log(`Setting autosave to ${commander.save} seconds.`);
    clearInterval(saveInterval);
    saveInterval = setInterval(() => {
      GameState.PlayerManager.saveAll();
    }, commander.save * 1000);

    // Ticks for effect processing and combat happen every half second
    clearInterval(tickInterval);
    tickInterval = setInterval(() => {
      GameState.AreaManager.tickAll(GameState);
      GameState.ItemManager.tickAll();
    }, Config.get('entityTickFrequency', 100));

    clearInterval(playerTickInterval);
    playerTickInterval = setInterval(() => {
      GameState.PlayerManager.emit('updateTick');
    }, Config.get('playerTickFrequency', 100));
  }
}

// START IT UP!
init();
// vim: set syn=javascript :
