'use strict';

/**
 * Keeps track of the queue off commands to execute for a player
 */
class CommandQueue {
  constructor() {
    this.commands = [];
    this.lag = 0;
    this.lastRun = 0;
  }

  /**
   * @param {{execute: function (), label: string}} executable Thing to run with an execute and a queue label
   * @param {number} lag Amount of lag to apply to the queue after the command is run
   */
  enqueue(executable, lag) {
    let newIndex = this.commands.push(Object.assign(executable, { lag })) - 1;
    return newIndex;
  }

  get hasPending() {
    return this.commands.length > 0;
  }

  /**
   * Execute the currently pending command if it's ready
   * @return {boolean} whether the command was executed
   */
  execute() {
    if (!this.commands.length || Date.now() - this.lastRun < this.lag) {
      return false;
    }

    const command = this.commands.shift();

    this.lastRun = Date.now();
    this.lag = command.lag;
    command.execute();
    return true;
  }

  /**
   * @type {Array<Object>}
   */
  get queue() {
    return this.commands;
  }

  /**
   * Flush all pending commands
   */
  flush() {
    this.commands = [];
    this.lag = 0;
    // do not clear lastRun otherwise player's could exploit by immediately
    // clearing after a command was executed
  }

  /**
   * In seconds get how long until the next command will run, rounded to nearest tenth of a second
   * @type {number}
   */
  get lagRemaining() {
    return this.commands.length ? this.getTimeTilRun(0) : 0;
  }

  /**
   * For a given command index find how long until it will run
   * @param {number} commandIndex
   * @return {number}
   */
  getTimeTilRun(commandIndex) {
    if (!this.commands[commandIndex]) {
      throw new RangeError("Invalid command index");
    }

    let lagTotal = 0;
    for (let i = 0; i < this.commands.length; i++) {
      const command = this.commands[i];
      lagTotal += command.lag;
      if (i === commandIndex) {
        return Math.max(0, this.lastRun + lagTotal - Date.now()) / 1000;
      }
    }
  }
}

module.exports = CommandQueue;
