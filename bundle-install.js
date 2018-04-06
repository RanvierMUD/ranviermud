#!/usr/bin/env node
'use strict';

const fs = require('fs');
const resolve = require('path').resolve;
const join = require('path').join;
const cp = require('child_process');
const os = require('os');

const bundles = resolve(__dirname, './bundles/');

fs.readdirSync(bundles)
  .forEach(bundle => {
    const bundlePath = join(bundles, bundle);

    // ensure path has package.json
    if (!fs.existsSync(join(bundlePath, 'package.json'))) return;

    // npm binary based on OS
    const npmCmd = os.platform().startsWith('win') ? 'npm.cmd' : 'npm';

    // install folder
    cp.spawn(npmCmd, ['i'], { env: process.env, cwd: bundlePath, stdio: 'inherit' });
  });
