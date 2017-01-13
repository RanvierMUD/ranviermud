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
    router.get('/', (req, res) => res.json({ message: 'hooray! welcome to our api!' }));

    app.use('/api', router);

    app.listen(this.port);
    util.log(`WEB: Web API activated and running on port ${this.port}.`);
    
  }

}

module.exports = WebInterface;