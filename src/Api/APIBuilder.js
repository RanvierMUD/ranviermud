const express = require('express');
const router = express.Router();
const path = require('path');
const celebrate = require('celebrate');

const Config = require('../Config');
const validators = require('../Validators');
const FileManager = require('../DataManagement/BundleDataManager');

class APIBuilder {

  constructor(state) {
    this.fileManager = new FileManager(state);
    this.fileManager.loadBundles(path.join(__dirname, '..', '..'));
  }

  setupRoutes() {

    router.get('/bundles', this.getBundles.bind(this));
    router.get('/bundles/:bundleName', this.getBundle.bind(this));
    router.get('/bundles/:bundleName/areas', this.getAreas.bind(this));
    router.get('/bundles/:bundleName/areas/:areaName', this.getArea.bind(this));
    router.get('/bundles/:bundleName/areas/:areaName/npcs', this.getNpcs.bind(this));
    router.get('/bundles/:bundleName/areas/:areaName/rooms', this.getRooms.bind(this));
    router.get('/bundles/:bundleName/areas/:areaName/items', this.getItems.bind(this));

    router.post('/bundles', this.postBundle.bind(this));
    router.post('/bundles/:bundleName/areas', celebrate({body: validators.area}), this.postArea.bind(this));

    router.put('/bundles/:bundleName/areas/:areaName/npcs', celebrate({body: validators.npc}), this.putNpc.bind(this));
    router.put('/bundles/:bundleName/areas/:areaName/items', celebrate({body: validators.item}), this.putItem.bind(this));
    router.put('/bundles/:bundleName/areas/:areaName/rooms', celebrate({body: validators.room}), this.putRoom.bind(this));

    return router;
  }

  getBundles(req, res) {
    const bundles = this.fileManager.getBundles();
    const result = Object.keys(bundles);

    res.send({bundles: result});
  }

  getBundle(req, res) {
    const bundle = this.fileManager.getBundleDirectory(req.params.bundleName);
    const areas = Object.keys(bundle.areas);

    res.send({bundleName: req.params.bundleName, areas: areas});
  }

  postBundle(req, res) {
    try {
      const bundle = this.fileManager.createBundle(req.body.bundleName);
      res.sendStatus(201);
    } catch (err) {
      res.send(400, err.message);
    }
  }

  getAreas(req, res) {
    const bundle = this.fileManager.getBundleDirectory(req.params.bundleName);
    const areas = Object.keys(bundle.areas);
    return res.send({bundleName: req.params.bundleName, areas: areas});
  }

  getArea(req, res) {
    const bundle = this.fileManager.getBundleDirectory(req.params.bundleName);
    const area = bundle.getArea(req.params.areaName);

    return res.send({
      bundle: req.params.bundleName,
      area: req.params.areaName,
      items: area.items,
      npcs: area.npcs,
      rooms: area.rooms
    });
  }

  getItems(req, res) {
    try {
      const bundle = this.fileManager.getBundleDirectory(req.params.bundleName);
      const area = bundle.getArea(req.params.areaName);
      res.send({items: area.items});
    } catch (err) {
      res.sendStatus(400, err.message);
    }
  }

  putItem(req, res) {
    try {
      const bundle = this.fileManager.getBundleDirectory(req.params.bundleName);
      const area = bundle.getArea(req.params.areaName);

      area.putItem(req.body);

      res.sendStatus(200);
    } catch (err) {
      res.sendStatus(400, err.message);
    }
  }

  getNpcs(req, res) {
    try {
      const bundle = this.fileManager.getBundleDirectory(req.params.bundleName);
      const area = bundle.getArea(req.params.areaName);
      res.send({npcs: area.npcs});
    } catch (err) {
      res.sendStatus(400, err.message);
    }
  }

  putNpc(req, res) {
    try {
      const bundle = this.fileManager.getBundleDirectory(req.params.bundleName);
      const area = bundle.getArea(req.params.areaName);

      area.putNpc(req.body);

      res.sendStatus(200);
    } catch (err) {
      res.sendStatus(400, err.message);
    }
  }

  getRooms(req, res) {
    try {
      const bundle = this.fileManager.getBundleDirectory(req.params.bundleName);
      const area = bundle.getArea(req.params.areaName);
      res.send({rooms: area.rooms});
    } catch (err) {
      res.sendStatus(400, err.message);
    }
  }

  putRoom(req, res) {
    try {
      const bundle = this.fileManager.getBundleDirectory(req.params.bundleName);
      const area = bundle.getArea(req.params.areaName);

      area.putRoom(req.body);

      res.sendStatus(200);
    } catch (err) {
      res.sendStatus(400, err.message);
    }
  }

  postArea(req, res) {
    try {
      const bundle = this.fileManager.getBundleDirectory(req.params.bundleName);

      const area = bundle.createArea({
        name: req.body.name,
        title: req.body.title,
        suggestedLevel: req.body.suggestedLevel
      });

      res.sendStatus(201);
    } catch (err){
      res.status(400).send(err.message);
    }
  }
}

module.exports = APIBuilder;