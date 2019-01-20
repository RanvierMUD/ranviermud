const fs = require('fs')
const resolve = require('path').resolve
const join = require('path').join
const cp = require('child_process')
const os = require('os')

const lib = resolve(__dirname, '../bundles/');

fs.readdirSync(lib).forEach(function (bundle) {
  const bundlePath = join(lib, bundle)
  if (!fs.existsSync(join(bundlePath, 'package.json'))) return;


  const npmCmd = os.platform().startsWith('win') ? 'npm.cmd' : 'npm';

  cp.spawn(npmCmd, ['i'], { env: process.env, cwd: bundlePath, stdio: 'inherit' });
});
