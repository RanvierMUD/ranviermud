'use strict'

const IntraCommand = require('./IntraCommand')

class Strike extends IntraCommand {
  constructor(user, target) {
    super(user, target)
  }

  isInstanceOf(string) {
    return string === "strike" || string === "Strike"
  }
}

module.exports = Strike;
