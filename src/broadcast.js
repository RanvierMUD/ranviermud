const Type = require('./type').Type;

const noop = function() {}
const toRoom = (location, firstParty, secondParty, players) => config => {

  const firstPartyMsger = Type.isPlayer(firstParty) ?
    firstParty.say : noop;
  const secondPartyMsger = Type.isPlayer(secondParty) ?
    secondParty.say : noop;
  const location = Type.isPlayer(firstParty) ?
    firstParty.getLocation() : firstParty.getRoom();
  const thirdPartyMsger = msg => players.eachAt(location, player => player.say(msg));

  firstPartyMsger(config.firstPartyMessage);
  secondPartyMsger(config.secondPartyMessage);
  thirdPartyMsger(config.thirdPartyMessage);

};

exports.Broadcast = { toRoom };
