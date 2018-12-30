#!/usr/bin/env node
'use strict';

const cp = require('child_process');
const fs = require('fs');
const os = require('os');
const readline = require('readline');

async function prompt() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve, reject) => {
    rl.question('Do you want to install the example bundles? [Y/n] ', resolve);
  });
}

async function main() {

  try {
    let answer = await prompt();

    if (answer === 'n') {
      throw 'foo';
    }
  } catch (err) {
    console.log('Done.');
    process.exit(0);
  }

  const githubPath = 'https://github.com/ranviermud/';
  const defaultBundles = [
    'bundle-example-areas',
    'bundle-example-bugreport',
    'bundle-example-channels',
    'bundle-example-classes',
    'bundle-example-combat',
    'bundle-example-commands',
    'bundle-example-crafting',
    'bundle-example-debug',
    'bundle-example-effects',
    'bundle-example-groups',
    'bundle-example-input-events',
    'bundle-example-lib',
    'bundle-example-npc-behaviors',
    'bundle-example-player-events',
    'bundle-example-quests',
    'bundle-example-telnet',
    'bundle-example-vendors',
    'bundle-example-websocket',
    'progressive-respawn',
  ];
  const enabledBundles = [];

  // check if we're in a repo
  if (!fs.existsSync(`${__dirname}/.git`)) {
    console.error('Not in a git repo.');
    process.exit(1);
  }

  const modified = cp.execSync('git status -uno --porcelain').toString();
  if (modified) {
    console.warn('You have uncommitted changes. For safety setup-bundles must be run on a clean repository.');
    process.exit(1);
  }

  console.info('Adding bundles as submodules...');
  const cpOpts = {
    env: process.env, cwd: __dirname, stdio: 'inherit'
  };

  // add each bundle as a submodule
  for (const bundle of defaultBundles) {
    const bundlePath = `bundles/${bundle}`;
    cp.spawnSync('git', ['submodule', 'add', githubPath + bundle, bundlePath], cpOpts);
    enabledBundles.push(bundle);

    const fullBundlePath = __dirname + '/' + bundlePath;

    // npm binary based on OS
    const npmCmd = os.platform().startsWith('win') ? 'npm.cmd' : 'npm';

    if (fs.existsSync(fullBundlePath + '/package.json')) {
      cp.spawnSync(npmCmd, ['install', '--no-audit'], {
        cwd: fullBundlePath
      });
    }
  }
  console.info('Done.');

  console.info('Updating enabled bundle list...');
  const ranvierJson = require('./ranvier.json');
  const joinedBundles = new Set([...enabledBundles, ...ranvierJson.bundles]);
  ranvierJson.bundles = [...joinedBundles];
  fs.writeFileSync('./ranvier.json', JSON.stringify(ranvierJson, null, 2));
  cp.spawnSync('git', ['add', './ranvier.json'], cpOpts);
  console.info('Done.');

  console.info(`
-------------------------------------------------------------------------------
Example bundles have been installed as submodules. It's recommended that you now
run the following commands:

  git commit -m "Install bundles"

You're all set! See https://ranviermud.com for guides and API references
`);

  process.exit(0);
}

try {
  main();
} catch (err) {
  console.error(err);
  process.exit(1);
}
