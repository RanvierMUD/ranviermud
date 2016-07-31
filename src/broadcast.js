const Type = require('./type').Type;
const util = require('util');

const noop = function() {}
const toRoom = (location, firstParty, secondParty, players) => config => {
  util.log(players);
  util.log(config);
  const firstPartyMsger = Type.isPlayer(firstParty) ?
    firstParty.say : noop;
  const secondPartyMsger = Type.isPlayer(secondParty) ?
    secondParty.say : noop;
  const location = Type.isPlayer(firstParty) ?
    firstParty.getLocation() : firstParty.getRoom();
  const thirdPartyMsger = msg => players.broadcastAt(location, msg);

  firstPartyMsger(config.firstPartyMessage);
  secondPartyMsger(config.secondPartyMessage);
  thirdPartyMsger(config.thirdPartyMessage);

};

exports.Broadcast = { toRoom };
