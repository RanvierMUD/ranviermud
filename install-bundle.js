#!/usr/bin/env node
'use strict';

const fs = require('fs');
const resolve = require('path').resolve;
const join = require('path').join;
const cp = require('child_process');
const os = require('os');

const pkgPath = resolve(__dirname, 'package.json');
const ranvierConfigPath = resolve(__dirname, 'ranvier.json');
const ranvierConfig = require(ranvierConfigPath);
let bundlePackage = process.argv[2].trim();

function exit (msg) {
  console.log(msg)
  process.exit()
}

function addToRanvier() {
  const packageDotJSON = require(pkgPath);

  let pkgName;
  const dependencies = new Map(Object.entries(packageDotJSON.dependencies))
  for (const [name, url] of dependencies) {
    if (name == bundlePackage || url.indexOf(bundlePackage) !== -1) {
      pkgName = name;
    }
  }

  if (!pkgName) {
    exit('Could not find bundle in package.json after running npm install')
  }

  if (ranvierConfig.bundles.indexOf(pkgName) >= 0) {
    exit('Bundle already installed');
  }
  else {
    ranvierConfig.bundles.push(pkgName);
    const json = JSON.stringify(ranvierConfig, null, 2)
    if (json) {
      fs.writeFileSync(ranvierConfigPath, json, 'utf8');
    }
    exit('Installed bundle ' + pkgName + '!')
  }
}

if (!bundlePackage) {
  exit('bundlePackage is required, `node install-bundle.js npm-name-of-bundle');
  process.exit()
}

bundlePackage = bundlePackage.split("github.com:").join("github.com/")

// npm binary based on OS
const npmCmd = os.platform().startsWith('win') ? 'npm.cmd' : 'npm';

const args = ['install', bundlePackage, '--save'];
console.log('Running `npm ' + args.join(" ") + '`');

//This is just here for testing, if you change it to true you can test
//addToRanvier() without having to wait for npm install every time
if (false) {
  addToRanvier()
}
else {
  const child = cp.spawn(npmCmd, args, { env: process.env, stdio: 'inherit' });
  let hasError = false
  child.on('exit', (result) => {
    if (hasError) {
      return
    }
    addToRanvier()
  })
  child.on('error', (err) => {
    hasError = true
    exit("ERROR:", err)
  })
}


