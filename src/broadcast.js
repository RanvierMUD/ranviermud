const noop = function() {}
const toRoom = (location, firstParty, secondParty, players) => config => {

  const firstPartyMsger = Type.isPlayer(firstParty) ?
    firstParty.say : noop;
  const secondPartyMsger = Type.isPlayer(secondParty) ?
    secondParty.say : noop;
  const thirdPartyMsger = msg => players.eachAt(firstParty.getLocation(), player => player.say(msg));

  firstPartyMsger(config.firstPartyMessage);
  secondPartyMsger(config.secondPartyMessage);
  thirdPartyMsger(config.thirdPartyMessage);

};

exports.Broadcast = { toRoom };
