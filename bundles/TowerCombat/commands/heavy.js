"use strict";
const handleIntraCmd = require("./intraCmdHandler");

module.exports = {
  command: (state) => (arg, character) =>
    handleIntraCmd(arg, character, "heavy"),
};
