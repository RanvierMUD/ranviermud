const Player  = require('./player').Player;
const Npc     = require('./npc').Npc;
const Item    = require('./items').Item;
const Account = require('./accounts').Account;


const isPlayer  = is(Player);
const isNpc     = is(Npc);
const isItem    = is(Item);
const isAccount = is(Account);

exports.Type = {
  isPlayer, isNpc,
  isItem,   isAccount,
};

/**
 * Takes a constructor and a thing and returns function
 * which then returns a boolean (partial application station)
 * @param typeClass constructor functions
 * @param thing     object
 * @return boolean True is thing is of typeClass
 */

function is(typeClass) {
  return thing => thing instanceof typeClass;
}
