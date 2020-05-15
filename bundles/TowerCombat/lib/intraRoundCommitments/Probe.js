'use strict'

const IntraCommand = require('./IntraCommand')

class Probe extends IntraCommand {
  constructor(user, target) {
    super(user, target)
  }

  isInstanceOf(string) {
    return string === "probe" || string === "Probe"
  }
}

module.exports = Probe;
