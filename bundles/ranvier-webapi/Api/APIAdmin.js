const express = require('express');
const router = express.Router();
const celebrate = require('celebrate');

class APIAdmin {

  constructor(state, srcPath) {
    this.state  = state;
    this.Config = require(srcPath + 'Config');
    this.Data   = require(srcPath + 'Data');
    this.validators = require(srcPath + 'Validators');
  }

  setupRoutes() {
    const { MobFactory, PlayerManager, ItemManager, RoomManager, HelpManager, AreaManager, QuestFactory, AccountManager } = this.state;

    router.get('/npcs', this.getResponseData(MobFactory, 'entities'));
    // router.get('/players', this.getPlayers());
    router.get('/data', this.getData());
    router.get('/items', this.getResponseData(ItemManager, 'items'));
    router.get('/rooms', this.getResponseData(RoomManager, 'rooms'));
    router.get('/areas', this.getResponseData(AreaManager, 'areas'));
    router.get('/quests', this.getResponseData(QuestFactory, 'quests'));

    router.get('/npcs/count', this.getCount(MobFactory, 'entities'));
    router.get('/players/count', this.getCount(PlayerManager, 'players'));
    router.get('/data/count', this.getDataCount());
    router.get('/items/count', this.getCount(ItemManager, 'items'));
    router.get('/rooms/count', this.getCount(RoomManager, 'rooms'));
    router.get('/areas/count', this.getCount(AreaManager, 'areas'));
    router.get('/quests/count', this.getCount(QuestFactory, 'quests'));

    router.get('/help', this.getResponseData(HelpManager, 'helps'));

    router.get('/config', this.getConfig());
    router.put('/config', celebrate({body: this.validators.config}), this.putConfig());

    return router;
  }

  putConfig() {
    return (req, res) => {
      Config.save(req.body);
      return res.sendStatus(200);
    };
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

  getCount(manager, name) {
    return (req, res) => {
      const data = this.parseEntitiesIntoResponse(manager, name);
      return res.json({count: data.length});
    }
  }

  /**
   * Endpoint to search data in Data\accounts and Data\players
   * 
   * @returns 
   * @memberof APIAdmin
   */
  getData() {
    return (req, res) => {
      const data = this.Data.searchData(req.query.type, req.query.name);
      return res.json({[req.query.type + 's']: data});
    }
  }

  getDataCount() {
    return (req, res) => {
      const data = this.Data.searchData(req.query.type, '.json'); //all files contain .json
      return res.json({count: data.length});
    }
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
