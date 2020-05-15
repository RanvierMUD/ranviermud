'use strict'

const IntraCommand = require('./IntraCommand')

class Guard extends IntraCommand {
  constructor(user, target) {
    super(user, target)
  }

  isInstanceOf(string) {
    return string === "guard" || string === "Guard"
  }
}

module.exports = Guard;
