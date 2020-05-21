const { Broadcast: B, Logger } = require("ranvier");

module.exports = {
  newGuard: (state) =>
    function (target) {
      B.sayAt(
        this,
        `You regard ${target} warily, waiting for a chance to strike.`
      );
    },
  guardLightMitigate: (state) =>
    function (target) {
      B.sayAt(
        this,
        `You lean into ${target}'s strike, shrugging off some of the blow.`
      );
    },
  guardHeavyMitigate: (state) =>
    function (target) {
      B.sayAt(
        this,
        `You lean into ${target}'s mighty blow, taking the worst of it but preventing some of the pain.`
      );
    },
  guardDodgeAdvantage: (state) =>
    function () {
      B.sayAt(this, `You easily slip into the dodge movement.`);
    },
};
