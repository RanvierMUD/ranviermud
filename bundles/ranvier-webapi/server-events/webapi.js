'use strict';

// import 3rd party libraries
const express    = require('express');
const whitelist  = require('whitelist-ips');
const bodyParser = require('body-parser');
const cors       = require('cors');
const celebrate  = require('celebrate');

const ApiBuilder = require('../Api/ApiBuilder');
const ApiAdmin   = require('../Api/ApiAdmin');

module.exports = srcPath => {
  const Logger = require(srcPath + 'Logger');
  const Config = require(srcPath + 'Config');

  return {
    listeners: {
      startup: state => function (commander) {
        const app = express();
        const router = express.Router();

        app.use(cors());
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());

        const setupMiddleWare = () => {
          app.use('/api/builder', new ApiBuilder(state, srcPath).setupRoutes());
          app.use('/api/admin', new ApiAdmin(state, srcPath).setupRoutes());
          app.set('json spaces', 2);
          app.use(celebrate.errors());

          const whiteListed = Config.get('webWhitelist') || [
            'localhost'
          ];

          app.use(whitelist(whiteListed));
          app.use((err, req, res, next) => {
            if (err.name == "WhitelistIpError") {
              Logger.log(`[WEB]: Forbidden request: ${req.ip}`);
              res.status(403).send('Forbidden');
            }
          });
        };

        const init = () => {
          Logger.log('[WEB] Initializing...');
          const port = Config.get('webPort') || 9000;
          setupMiddleWare();
          app.listen(port);
          Logger.log(`[WEB]: Web API activated and running on port ${port}.`);
        }

        init();
      },

      shutdown: state => function () {
        // no need to do anything special in shutdown
      },
    }
  };
};
