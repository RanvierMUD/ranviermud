const { Broadcast: B } = require("ranvier");
const locMap = {
  en: {
    strike: "strike",
    guard: "guard",
  },
};
module.exports = {
  outOfCombatErr: (state) =>
    function (type) {
      B.sayAt(this, `You prepare to ${type}! ... Against whom?`);
    },
  alreadyErr: (state) =>
    function (type) {
      B.sayAt(this, `You're already prepared to ${type}!`);
    },
  msgPrepareCmd: (state) =>
    function (type) {
      B.sayAt(this, `You prepare to ${type}!`);
    },
  commandSwitch: (state) =>
    function (type) {
      B.sayAt(this, `You change your mind...`);
    },
};
