const util    = require('util');
const express = require('express');
const app     = express();
const router  = express.Router();

const Config = require('./Config');


class WebInterface {
  
  constructor(state) {
    this.state = state;
    this.port  = Config.get('webPort') || 9000;
  }

  init() {

    // Routes for the API's GET response.
    router.get('/',        (req, res) => res.json(this.state));
    router.get('/npcs',    (req, res) => res.json(this.state.MobFactory.npcs));
    router.get('/players', (req, res) => res.json(this.state.PlayerManager.players));
    router.get('/items',   (req, res) => res.json(this.state.ItemManager.items));
    router.get('/rooms',   (req, res) => res.json(this.state.RoomManager.rooms));
    router.get('/help',    (req, res) => res.json(this.state.HelpManager.helps));

    app.use('/api', router);

    app.listen(this.port);
    util.log(`WEB: Web API activated and running on port ${this.port}.`);
    
  }

}

module.exports = WebInterface;