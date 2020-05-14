'use strict'

const IntraCommand = require('./IntraCommand')

class Guard extends IntraCommand {
  constructor() {
    super()
  }

  isInstanceOf(string) {
    return string === "guard" || string === "Guard"
  }
}

module.exports = Guard;
