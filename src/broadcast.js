const Type   = require('./type').Type;
const Random = require('./random').Random;
const _ = require('./helpers');
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

  const firstPartyMsger  = Type.isPlayer(firstParty)  ?
    firstParty.say :  noop;
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

const consistentMessage = (broadcaster, messageLists)  => {
  const listLengths = _
    .values(messageLists)
    .map(list => list.length);

  const sameLength = listLengths
    .reduce((prev, length) => prev === undefined ?
      length :
      prev === length ? length : false);


  if (!sameLength) {
    throw new Error("Arrays must have the same number of messages.");
  }

  const selection = Random.inRange(0, messageLists.thirdPartyMessage.length - 1);
  const messages = {};
  for (const messageList in messageLists) {
    messages[messageList] = messageLists[messageList][selection];
  }

  util.log('Broadcasting........');
  util.log(messages);

  broadcaster(messages);
};

exports.Broadcast = { toRoom, toArea, consistentMessage };
