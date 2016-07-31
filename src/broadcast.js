const noop = function() {}
const broadcastToRoom = (location, firstParty, secondParty, players) => {

  const firstPartyMsger = Type.isPlayer(firstParty) ?
    firstParty.say : noop;
  const secondPartyMsger = Type.isPlayer(secondParty) ?
    secondParty.say : noop;
  const thirdPartyMsger = msg => players.eachAt(firstParty.getLocation(), player => player.say(msg)); 
}

exports.Broadcast = {};
