const express = require('express');
const router = express.Router();
const celebrate = require('celebrate');
const validators = require('../Validators');

const Config = require('../Config');

class APIAdmin {

  constructor(state) {
    this.state = state;
  }

  setupRoutes() {

    router.get('/config', this.getConfig());
    router.put('/config', celebrate({body: validators.config}), this.putConfig());

    return router;
  }

  putConfig() {
    return (req, res) => {
      Config.save(req.body);
      return res.sendStatus(200);
    }
  }

  getConfig() {
    return (req, res) => {
      const response = Config.getAll();
      return res.json(response);
    };
  }
}

module.exports = APIAdmin;