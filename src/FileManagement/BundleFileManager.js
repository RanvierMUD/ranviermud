'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const chokidar = require('chokidar');

const AreaFileManager = require('./AreaFileManager');
const BundleFolder = require('./BundleFolder');

/**
 * File Manager for bundles
 *
 * @class BundleFileManager
 */
class BundleFileManager {

  constructor(state) {
    this.state = state;
    this.excludedBuilderBundles = this.state.Config.get('excludedBuilderBundles', []);
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

      // only load bundles we allow builders to manage
      if (this.excludedBuilderBundles.indexOf(bundle) > -1) {
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
    this.bundles[bundleName] = new BundleFolder(this.state, bundleName, path.join(this.basePath, bundleName)).load();
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
   * @memberOf BundleFileManager
   */
  getBundleDirectory (bundleName) {
    return this.bundles[bundleName];
  }

  /**
   * Create a new bundle directory
   *
   * @returns 
   *
   * @memberOf BundleFileManager
   */
  createBundle(bundleName) {
    if (this.bundleExists(bundleName)) {
      throw new Error(`Bundle ${bundleName} already exists`);
    }

    const newBundlePath = path.join(this.basePath, bundleName);
    const newBundleAreasPath = path.join(this.basePath, bundleName, 'areas');

    fs.mkdirSync(newBundlePath);
    fs.mkdirSync(newBundleAreasPath);

    this.bundles[bundleName] = new BundleFolder(this.state, bundleName, path.join(this.basePath, bundleName)).load();
  }


  /**
   * Create an area under a bundle
   *
   * @param {any} area 
   * @returns 
   *
   * @memberOf BundleFileManager
   */
  createArea(area) {
    const {name, title, suggestedLevel} = area;

    if (!name) {
      throw new Error('name is required');
    }

    if (!title) {
      throw new Error('title is required');
    }

    if (!suggestedLevel) {
      throw new Error('suggestedLevel is required');
    }

    if (this.areaExists(name)) {
      throw new Error(`Area ${name} already exists`);
    }

    if (!fs.existsSync(path.join(this.basePath, 'areas'))) {
      fs.mkdirSync(path.join(this.basePath, 'areas'));
    }

    fs.mkdirSync(path.join(this.basePath, 'areas', name));

    var manifest = yaml.dump({
      title: title,
      suggestedLevel: suggestedLevel
    });

    fs.writeFileSync(path.join(this.basePath, 'areas', name, 'manifest.yml'), manifest);

    const areaFileManager = new AreaFileManager(this.baseDirectory, this.bundleName, name);

    return areaFileManager;
  }

  getArea(areaName) {
    if (!this.areaExists(areaName)) {
      throw new Error(`Area ${area} does not exist. Did you create it?`);
    }

    return new AreaFileManager(this.baseDirectory, this.bundleName, areaName);
  }

  areaExists(areaName) {
    return fs.existsSync(path.join(this.basePath, 'areas', areaName));
  }

}

module.exports = BundleFileManager;