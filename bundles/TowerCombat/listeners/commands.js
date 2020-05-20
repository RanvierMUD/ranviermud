const { Broadcast: B, Logger } = require("ranvier");
const Strike = require("../lib/intraRoundCommitments/Strike");
const Guard = require("../lib/intraRoundCommitments/Guard");
const Probe = require("../lib/intraRoundCommitments/Probe");
const Dodge = require("../lib/intraRoundCommitments/Dodge");

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
        case "probe":
          this.combatData.decision = new Probe(this);
          break;
        case "dodge":
          this.combatData.decision = new Dodge(this);
          break;
        default:
          Logger.error(
            `${this.name} input a command type I couldn't parse. ${type}`
          );
      }
    },
};
