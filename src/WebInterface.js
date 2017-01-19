const util   = require('util');
const fs     = require('fs');
const jwt    = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Set up an Express app for the Web API.
const express    = require('express');
const bodyParser = require('body-parser');
const app        = express();
const router     = express.Router();
app.use(bodyParser.urlencoded({ extended: true }));

const Config = require('./Config');

class WebInterface {
  
  constructor(state) {
    this.state  = state;
    this.port   = Config.get('webPort') || 9000;
    this.secretFile = __dirname + '/../.ranvierSecret';
  }

  init() {
    util.log('[WEB] Initializing...');
    this.generateSecret();
    this.setUpGetRoutes();

    // Authentication route.
    router.post('/authenticate', this.authenticate);

    app.use('/api', router);

    app.listen(this.port);
    util.log(`[WEB]: Web API activated and running on port ${this.port}.`);
    util.log(`[WEB]: Web API Secret: ${this.secret}`);
  }

  generateSecret() {
    try {
      this.secret = fs.readFileSync(this.secretFile);
    } catch(e) {
      const salt  = bcrypt.genSaltSync(10);
      this.secret = bcrypt.hashSync('ranvier', salt);
      fs.writeFileSync(this.secretFile, this.secret);
    }
  }

  getSecret() {
    return this.secret;
  }

  setUpGetRoutes() {
    const message = { message: "RanvierMUD API Endpoints: /npcs /players /items /rooms /help" };
    const { MobFactory, PlayerManager, ItemManager, RoomManager, HelpManager } = this.state;

    // Routes for the API's GET response.
    router.get('/',        (req, res) => res.json(message));
    router.get('/npcs',    this.getResponseData(MobFactory, 'npcs'));
    router.get('/players', this.getResponseData(PlayerManager, 'players'));     
    router.get('/items',   this.getResponseData(ItemManager, 'items'));
    router.get('/rooms',   this.getResponseData(RoomManager, 'rooms'));
    router.get('/help',    this.getResponseData(HelpManager, 'helps'));
  }

  authenticate(req, res) {
    const accountName = req.body.name;
    const account = this.state.AccountManager.findByName(accountName);
    
    if (!account) {
      util.log(`[WEB] ${accountName} Auth Failed: Account not found.`);
      return res.json({ success: false, message: `${accountName} was not found.`});
    }

    if (account.password !== req.body.password) {
      util.log(`[WEB] ${accountName} Auth Failed: Incorrect password.`);
      return res.json({ success: false, message: `${accountName} password incorrect.`});
    }

    let secret    = this.getSecret();
    let expiresIn = "24h";
    const token   = jwt.sign(account, secret, { expiresIn });

    util.log(`[WEB] ${accountName} Auth Success!`);
    return res.json({ success: true, token, message: `${accountName} authenticated. Token good for ${expiresIn}.`});
  }

  getResponseData(manager, name) {
    return (req, res) => {
      const response = this.parseEntitiesIntoResponse(manager, name);
      util.log('[WEB] Request made for ${name}.');

      try {
        util.log('[WEB] Request success.');
        return res.json({ [name]: response });
      } catch (err) {
        util.log(`[WEB] Request failed: ${err}`);
        return res.json({ success: false, message: `An error has occurred: ${err}.` });
      } 
    }
  }

  parseEntitiesIntoResponse(manager, name) {
    const entities = manager[name];
    let response   = [];
    
    if (entities instanceof Set) {
      response = [...entities]; 
    }

    if (entities instanceof Map) {
      handleMap(entities, reponse);
    }

    function handleMap(entities, response) {
      for (let [key, value] of entities) {
        if (!value) { continue; }
        const val = value.serialize ? value.serialize() : value;
        response.push([key, val]);
      }
    }

    return response;
  }

}

module.exports = WebInterface;