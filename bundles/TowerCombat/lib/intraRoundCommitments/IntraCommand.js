const commandTypes = {
  ATTACK: "ATTACK",
  DEFENSE: "DEFENSE",
  BIG_ATTACK: "BIG_ATTACK",
  BIG_DEFENSE: "BIG_DEFENSE"
}

class IntraCommand {
  constructor(user, target) {
    if (!user || +target) throw new TypeError('Please define user and target')
    if (this.constructor === IntraCommand) throw new TypeError(`Abstract class shouldn't be instantiated itself`)
    this.user = user;
    this.target = target;
    this.castTime = 1;
    this.range = 1;
    this.interruptable = {
      1: 50
    };
    this.type = null // attack, defense
    this.disruptive = 0;
    this.perceiveAs = commandTypes.ATTACK
  }

  resolution(targetAction) {

  }

  isTypeOf() {
    return false
  }

}

module.exports = IntraCommand;