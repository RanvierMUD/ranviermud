const express = require('express');
const router = express.Router();
const celebrate = require('celebrate');
const validators = require('../Validators');

const Config = require('../Config');

class APIAdmin {

  constructor(state) {
    this.state = state;
  }

  setupRoutes() {
    const { MobFactory, PlayerManager, ItemManager, RoomManager, HelpManager } = this.state;

    router.get('/npcs', this.getResponseData(MobFactory, 'entities'));
    router.get('/players', this.getResponseData(PlayerManager, 'players'));
    router.get('/items', this.getResponseData(ItemManager, 'items'));
    router.get('/rooms', this.getResponseData(RoomManager, 'rooms'));
    router.get('/help', this.getResponseData(HelpManager, 'helps'));

    router.get('/config', this.getConfig());
    router.put('/config', celebrate({body: validators.config}), this.putConfig());

    return router;
  }

  putConfig() {
    return (req, res) => {
      Config.save(req.body);
      return res.sendStatus(200);
    }
  }

  getConfig() {
    return (req, res) => {
      const response = Config.getAll();
      return res.json(response);
    };
  }

  getResponseData(manager, name) {
    return (req, res) => {
      const response = this.parseEntitiesIntoResponse(manager, name);
      return res.json({ [name]: response });
    };
  }

  parseEntitiesIntoResponse(manager, name) {
    const entities = manager[name];
    let response = [];

    if (entities instanceof Set) {
      response = [...entities];
    }

    if (entities instanceof Map) {
      handleMap(entities, response);
    }

    function handleMap(entities, response) {
      for (let [key, value] of entities) {
        if (!value) { continue; }
        const val = value.serialize ? value.serialize() : value;
        response.push(val);
      }
    }
    return response;
  }
}

module.exports = APIAdmin;