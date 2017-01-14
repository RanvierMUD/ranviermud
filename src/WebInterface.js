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

    const message = { message: "RanvierMUD API Endpoints: /npcs /players /items /rooms /help" };
    // Routes for the API's GET response.
    router.get('/',        (req, res) => res.json(message));
    router.get('/npcs',    this.getResponseData(this.state.MobFactory, 'npcs'));
    router.get('/players', this.getResponseData(this.state.PlayerManager, 'players'));     
    router.get('/items',   this.getResponseData(this.state.ItemManager, 'items'));
    router.get('/rooms',   this.getResponseData(this.state.RoomManager, 'rooms'));
    router.get('/help',    this.getResponseData(this.state.HelpManager, 'helps'));

    app.use('/api', router);

    app.listen(this.port);
    util.log(`WEB: Web API activated and running on port ${this.port}.`);
  }

  getResponseData(stateObj, name) {
    return (req, res) => {
      util.log('[WEB] Request made for ${name}.');

      const blob   = stateObj[name];
      let response = [];
      
      if (blob instanceof Set) {
        response = [...blob]; 
      }

      if (blob instanceof Map) {
        for (let [key, value] of blob) {
          if (!value) { continue; }
          try {
            response.push([key, value.serialize()]);
          } catch(e) {
            response.push([key, value]);
          }
        }
      }

      try {
        return res.json({ [name]: response });
      } catch (err) {
        return res.json({ error: `An error has occurred: ${err}.` });
      } 

    }
  } 
}

module.exports = WebInterface;