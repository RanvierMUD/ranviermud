'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const chokidar = require('chokidar');

const BundleData = require('./BundleData');

/**
 * Bundle Data Manager
 *
 * @class BundleDataManager
 */
class BundleDataManager {

  constructor(state) {
    this.state = state;
    this.bundles = [];
  }

  loadBundles(baseDirectory) {
    this.basePath = path.join(baseDirectory, "bundles");

    const bundles = fs.readdirSync(this.basePath);

    for (const bundle of bundles) {
      const bundlePath = path.join(this.basePath, bundle);
      if (fs.statSync(bundlePath).isFile() || bundle === '.' || bundle === '..') {
        continue;
      }

      this.loadBundle(bundle);
    }

    const watcher = chokidar.watch(this.basePath, {ignoreInitial: true});

    watcher.on('addDir', newDir => {
      this.loadBundle(path.basename(newDir));
    });
  }

  loadBundle(bundleName) {
    this.bundles[bundleName] = new BundleData(this.state, bundleName, path.join(this.basePath, bundleName)).load();
  }

  getBundles() {
    return this.bundles;
  }

  bundleExists(bundleName) {
    return fs.existsSync(path.join(this.basePath, bundleName));
  }

  /**
   * Get a bundle directory by name
   * 
   * @param {any} bundleName 
   * @returns BundleFolder
   * 
   * @memberOf BundleDataManager
   */
  getBundleDirectory (bundleName) {
    return this.bundles[bundleName];
  }

  /**
   * Create a new bundle
   *
   * @memberOf BundleDataManager
   */
  createBundle(bundleName) {
    if (this.bundleExists(bundleName)) {
      throw new Error(`Bundle ${bundleName} already exists`);
    }

    const newBundlePath = path.join(this.basePath, bundleName);
    const newBundleAreasPath = path.join(this.basePath, bundleName, 'areas');

    fs.mkdirSync(newBundlePath);
    fs.mkdirSync(newBundleAreasPath);

    this.bundles[bundleName] = new BundleData(this.state, bundleName, path.join(this.basePath, bundleName)).load();
  }

}

module.exports = BundleDataManager;