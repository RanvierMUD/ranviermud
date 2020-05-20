const { perceptionTypes } = require("./commands.enum");
const { Player } = require("ranvier");

class IntraCommand {
  constructor(user, target) {
    if (!user || !target) throw new TypeError("Please define user and target");
    if (this.constructor === IntraCommand)
      throw new TypeError(`Abstract class shouldn't be instantiated itself`);
    this.enforceConfig();
    this.user = user;
    this.target = target;
  }

  resolve() {}

  /**
   * This funciton reinforces basic rules for the configs. A sanity check
   * against my own carelessness.
   */
  enforceConfig() {
    if (this.user instanceof Player)
      throw new Error(
        "Passed something other than a player to your intraCommand"
      );
    if (this.target instanceof Player)
      throw new Error(
        "Passed something other than a player to your intraCommand"
      );
    const { config } = this;
    if (config == null) throw new Error("Config is undefined");
    if (typeof config.castTime !== "number")
      throw new Error("castTime should be a number");
    if (typeof config.range !== "number")
      throw new Error("range should be a number");
    if (typeof config.disruptive !== "number")
      throw new Error("disruptive should be a number");
    const mapping = perceptionTypes[config.perceiveAs];
    if (!mapping)
      throw new Error(
        `perceivedAs "${config.perceiveAs}" isn't in the commandType map, returned
        ${mapping}`
      );
    if (
      typeof config.perceptMod !== "number" ||
      config.perceptMod < 0 ||
      config.perceptMod > 1
    )
      throw new Error("perceptMod must be a number from 0 to 1");
    if (
      typeof config.perceptThreshold !== "number" ||
      config.perceptThreshold < 0 ||
      config.perceptThreshold > 100
    )
      throw new Error(
        `perceptThreshold must be a number from 0 to 100, received ${config.perceptThreshold}`
      );
  }

  isTypeOf() {
    return false;
  }

  get config() {
    return {
      castTime: 2,
      range: 1,
      interruptable: null,
      type: null, // strike, probe, parry, dodge
      disruptive: 0, // 0 to
      perceiveAs: perceptionTypes.DEFENSE,
      perceptMod: 1, // 0 to 1, 1 being the most perceptive, 0 being unable to perceive
      perceptThreshold: 10, // 0 to 100, 100 being totally unperceptable
    };
  }
}

module.exports = IntraCommand;
