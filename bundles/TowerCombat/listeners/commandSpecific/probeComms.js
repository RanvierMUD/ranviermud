const { Broadcast: B, Logger } = require("ranvier");

module.exports = {
  probeGainAdvantage: (state) =>
    function (target) {
      B.sayAt(this, `You spot a vital flaw in ${target}'s defenses!`);
    },
};
