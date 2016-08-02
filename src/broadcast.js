const Type   = require('./type').Type;
const Random = require('./random').Random;
const util = require('util');

const noop = function() {}

const toArea = (player, players, rooms) => msg => {
  players.eachExcept(player, p => {
    const otherRoom   = rooms.getAt(p.getLocation());
    const playerRoom  = rooms.getAt(player.getLocation());
    const sameArea    = otherRoom.getArea() === playerRoom.getArea();
    const notSameRoom = otherRoom !== playerRoom;

    if (sameArea && notSameRoom) {
      p.say(msg);
      p.prompt();
    }
  });
}

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

const consistentMessage = (broadcaster, secondPartyMessages, thirdPartyMessages)  => {
  if (secondPartyMessages.length !== thirdPartyMessages.length) {
    throw new Error("Arrays must have the same number of messages.");
  }

  const selection = Random.inRange(0, secondPartyMessages.length);
  const secondPartyMessage = secondPartyMessages[selection];
  const thirdPartyMessage  = thirdPartyMessages[selection];

  broadcaster({ secondPartyMessage, thirdPartyMessage });
};

exports.Broadcast = { toRoom, toArea, consistentMessage };
