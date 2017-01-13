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
    util.log("this.state.PlayerManager.players", this.state.PlayerManager.players);
    // Routes for the API's GET response.
    router.get('/',        (req, res) => res.json(this.state));
    router.get('/npcs',    (req, res) => res.json({ npcs: this.state.MobFactory }));
    router.get('/players', (req, res) => res.json({ players: this.state.PlayerManager.players }));     
    router.get('/items',   (req, res) => res.json({ items: this.state.ItemManager.items }));
    router.get('/rooms',   (req, res) => res.json({ rooms: this.state.RoomManager.rooms }));
    router.get('/help',    (req, res) => res.json({ help: this.state.HelpManager.helps }));

    app.use('/api', router);

    app.listen(this.port);
    util.log(`WEB: Web API activated and running on port ${this.port}.`);
    
  }

}

module.exports = WebInterface;