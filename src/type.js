'use strict';


const Type = { config };

function config(Player, Npc, Item, Account) {
  Type.isPlayer  = is(Player);
  Type.isNpc     = is(Npc);
  Type.isItem    = is(Item);
  Type.isAccount = is(Account);

}

exports.Type = Type;



/**
 * Takes a constructor and a thing and returns function
 * which then returns a boolean (partial application station)
 * @param typeClass constructor functions
 * @param thing     object
 * @return boolean True is thing is of typeClass
 */

function is(typeClass) {
  console.log(typeClass);
  return thing => thing ?
    thing instanceof typeClass :
    false;
}
