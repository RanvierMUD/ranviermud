const { Broadcast: B, Logger } = require("ranvier");
const Strike = require("../lib/intraRoundCommitments/strike");
const Guard = require("../lib/intraRoundCommitments/guard");
module.exports = {
  prepareCmd: (state) =>
    function (type) {
      switch (type) {
        case "strike":
          this.combatData.decision = new Strike(this);
          break;
        case "guard":
          this.combatData.decision = new Guard(this);
          break;
        default:
          Logger.log(
            `${this.name} input a command type I couldn't parse. ${type}`
          );
      }
    },
};
