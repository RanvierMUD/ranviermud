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

    const isFirstParty  = player === firstParty;
    const isSecondParty = player === secondParty;
    const name = player.getShortDesc();
    util.log(name + ' is 1stparty? ',isFirstParty);
    util.log(name + ' is 2ndparty? ',isSecondParty);
    const inSameRoom    = room.getLocation() === player.getLocation();
    util.log('is in same room??? ', inSameRoom);
    return !isFirstParty && !isSecondParty && inSameRoom;
  };

  util.log(config);

  const thirdPartyMsger = msg => players.eachIf(
    player => isThirdPartyInRoom(player),
    player => player.say(msg));

  if (config.firstPartyMessage) {
    firstPartyMsger(config.firstPartyMessage);
  }
  if (config.secondPartyMessage) {
    secondPartyMsger(config.secondPartyMessage);
  }
  if (config.thirdPartyMessage) {
    util.log('should see STUFF, OKAY');
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

  broadcaster(messages);
};

exports.Broadcast = { toRoom, toArea, consistentMessage };
