const util   = require('util');
const fs     = require('fs');
const bcrypt = require('bcryptjs');

// Set up an Express app for the Web API.
const express    = require('express');
const whitelist  = require('whitelist-ips');
const bodyParser = require('body-parser');
const app        = express();
const router     = express.Router();
app.use(bodyParser.urlencoded({ extended: true }));

const Config = require('./Config');

class WebInterface {
  
  constructor(state) {
    this.state  = state;
    this.port   = Config.get('webPort') || 9000;

    this.whiteListed = Config.get('webWhitelist') || [
      'localhost'
    ];
  }

  init() {
    util.log('[WEB] Initializing...');
    this.setUpMiddleWare();
    this.setUpGetRoutes();
    app.listen(this.port);
    util.log(`[WEB]: Web API activated and running on port ${this.port}.`);
  }

  setUpMiddleWare() {
    app.use('/api', router);
    app.use(whitelist(['127.0.0.1']));
    app.use((err, req, res, next) => {
      if (err.name == "WhitelistIpError") {
        util.log(`[WEB]: Forbidden request: ${req.ip}`);
        res.status(403).send('Forbidden');
      } else {
        util.log(`[WEB]: Illegal request: ${req.originalUrl}`);
        res.status(404).send('Not Found');
      }
    });
  }

  setUpGetRoutes() {
    const { MobFactory, PlayerManager, ItemManager, RoomManager, HelpManager } = this.state;

    // Routes for the API's GET response.
    router.get('/npcs',    this.getResponseData(MobFactory, 'npcs'));
    router.get('/players', this.getResponseData(PlayerManager, 'players'));     
    router.get('/items',   this.getResponseData(ItemManager, 'items'));
    router.get('/rooms',   this.getResponseData(RoomManager, 'rooms'));
    router.get('/help',    this.getResponseData(HelpManager, 'helps'));
  }

  getResponseData(manager, name) {
    return (req, res) => {
      const response = this.parseEntitiesIntoResponse(manager, name);
      return res.json({ [name]: response });
    };
  }

  parseEntitiesIntoResponse(manager, name) {
    const entities = manager[name];
    let response   = [];
    
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

module.exports = WebInterface;
