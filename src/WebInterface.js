const util   = require('util');
const fs     = require('fs');
const bcrypt = require('bcryptjs');

// Set up an Express app for the Web API.
const express    = require('express');
const whitelist  = require('whitelist-ips');
const bodyParser = require('body-parser');
const app        = express();
const router     = express.Router();
const celebrate  = require('celebrate');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const Config = require('./Config');
const APIBuilder = require('./APIBuilder');
const APIAdmin = require('./APIAdmin');

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
    app.listen(this.port);
    util.log(`[WEB]: Web API activated and running on port ${this.port}.`);
  }

  setUpMiddleWare() {
    app.use('/api/builder', new APIBuilder(this.state).setupRoutes());
    app.use('/api/admin', new APIAdmin(this.state).setupRoutes());
    app.use(celebrate.errors());
    app.use(whitelist(this.whiteListed));
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
}

module.exports = WebInterface;
