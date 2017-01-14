const util = require('util');
const fs   = require('fs');
const jwt  = require('jsonwebtoken');

// Set up an Express app for the Web API.
const express    = require('express');
const bodyParser = require('body-parser');
const app        = express();
const router     = express.Router();
app.use(bodyParser.urlencoded({ extended: true }));

const Config = require('./Config');

class WebInterface {
  
  constructor(state) {
    this.state = state;
    this.port  = Config.get('webPort') || 9000;
  }

  init() {

    const message = { message: "RanvierMUD API Endpoints: /npcs /players /items /rooms /help" };
    // Routes for the API's GET response.
    router.get('/',        (req, res) => res.json(message));
    router.get('/npcs',    this.getResponseData(this.state.MobFactory, 'npcs'));
    router.get('/players', this.getResponseData(this.state.PlayerManager, 'players'));     
    router.get('/items',   this.getResponseData(this.state.ItemManager, 'items'));
    router.get('/rooms',   this.getResponseData(this.state.RoomManager, 'rooms'));
    router.get('/help',    this.getResponseData(this.state.HelpManager, 'helps'));

    router.post('/authenticate', (req, res) => {
      const accountName = req.body.name;
      const account = this.state.AccountManager.findByName(accountName);
      
      if (!account) {
        util.log(`[WEB] ${accountName} Auth Failed: Account not found.`);
        return res.json({ success: false, message: `${accountName} was not found.`});
      }

      // Both passwords should be hashed... right?
      if (account.password !== req.body.password) {
        util.log(`[WEB] ${accountName} Auth Failed: Incorrect password.`);
        return res.json({ success: false, message: `${accountName} password incorrect.`});
      }

      let secret;
      try {
        secret = fs.readFileSync(__dirname + '/../.ranvierSecret');
      } catch(e) {
        util.log(`[WEB] Authenticated requests not available without a .ranverSecret file...`);
        return res.json({ success: false, message: 'Authentication failed, contact the administrator. '});
      }

      const token = jwt.sign(account, secret, {
        expiresIn: "24h"
      });

      util.log(`[WEB] ${accountName} Auth Success!`);
      return res.json({ success: true, token, message: `${accountName} authenticated.`});
      
    });


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
        util.log('[WEB] Request success.');
        return res.json({ [name]: response });
      } catch (err) {
        util.log(`[WEB] Request failed: ${err}`);
        return res.json({ success: false, message: `An error has occurred: ${err}.` });
      } 

    }
  } 
}

module.exports = WebInterface;