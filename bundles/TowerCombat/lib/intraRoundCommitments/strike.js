'use strict'

const IntraCommand = require('./IntraCommand')

class Strike extends IntraCommand {
  constructor() {
    super()
  }

  isInstanceOf(string) {
    return string === "strike" || string === "Strike"
  }
}

module.exports = Strike;
