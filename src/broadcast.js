const Type = require('./type').Type;
const util = require('util');

const noop = function() {}
const toRoom = (location, firstParty, secondParty, players) => config => {

  util.log('broadcast ->>>>', config);
  const firstPartyMsger = Type.isPlayer(firstParty) ?
    firstParty.say : noop;
  const secondPartyMsger = Type.isPlayer(secondParty) ?
    secondParty.say : noop;
  const thirdPartyMsger = msg => players.eachIf(
    player => {
      const isSpecificParty = party =>
        Type.isPlayer(party) && party.getAccountName() === player.getAccountName();
      const isFirstParty = isSpecificParty(firstParty);
      const isSecondParty = isSpecificParty(secondParty);
      if (!isFirstParty && !isSecondParty) {
        player.say(msg);
      }
    });



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
