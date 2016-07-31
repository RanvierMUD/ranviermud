const Type = require('./type').Type;
const util = require('util');

const noop = function() {}
const toRoom = (room, firstParty, secondParty, players) => config => {

  const firstPartyMsger = Type.isPlayer(firstParty) ?
    firstParty.say : noop;
  const secondPartyMsger = Type.isPlayer(secondParty) ?
    secondParty.say : noop;


  const isThirdPartyInRoom = player => {
    const isSpecificParty = party =>
      Type.isPlayer(party) && party.getAccountName() === player.getAccountName();
    const isFirstParty  = isSpecificParty(firstParty);
    const isSecondParty = isSpecificParty(secondParty);
    const inSameRoom    = room.getLocation() === player.getLocation();
    return !isFirstParty && !isSecondParty && inSameRoom;
  };

  const thirdPartyMsger = msg => players.eachIf(
    isThirdPartyInRoom,
    player => player.say(msg));

  if (config.firstPartyMessage) {
    firstPartyMsger(config.firstPartyMessage);
  }
  if (config.secondPartyMessage) {
    secondPartyMsger(config.secondPartyMessage);
  }
  if (config.thirdPartyMessage) {
    thirdPartyMsger(config.thirdPartyMessage);
  }

};

exports.Broadcast = { toRoom };
