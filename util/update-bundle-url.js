'use strict';

const fs = require('fs');
const { execSync } = require('child_process');
const commander = require('commander');

const gitRoot = execSync('git rev-parse --show-toplevel').toString('utf8').trim();

process.chdir(gitRoot);

commander.command('update-bundle-remote <bundle name> <remote url>');
commander.parse(process.argv);

if (commander.args.length < 2) {
  console.error(`Syntax: ${process.argv0} <bundle> <remote url>`);
  process.exit(0);
}

const [bundle, remote] = commander.args;

if (!fs.existsSync(gitRoot + `/bundles/${bundle}`)) {
  console.error('Not a valid bundle name');
  process.exit(0);
}

try {
  execSync(`git ls-remote ${remote}`);
} catch (err) {
  process.exit(0);
}

console.log("Updating remote url...");
execSync(`git config -f .gitmodules "submodule.bundles/${bundle}.url" ${remote}`, { stdio: 'ignore' });
console.log("Syncing...");
execSync('git submodule sync', { stdio: 'ignore' });
console.log("Updating...");
execSync('git submodule update --init --recursive --remote', { stdio: 'ignore' });
