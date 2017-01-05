const sty = require('sty');
const util = require('util');

const Type = require('../src/type').Type;

/**
 * Helper for advancing staged events
 * @param string stage
 * @param object firstarg Override for the default arg
 */
function gen_next(event) {
  /**
   * Move to the next stage of a staged event
   * @param Socket|Player socket       Either a Socket or Player on which emit() will be called
   * @param string        nextstage
   * @param ...
   */
  return function (socket, nextstage) {
    var func = (Type.isPlayer(socket) ? socket.getSocket() : socket);
    func.emit.apply(func, [event].concat([].slice.call(arguments)));
  }
}

/**
 * Helper for repeating staged events
 * @param Array repeat_args
 * @return function
 */
function gen_repeat(repeat_args, next) {
  return function () {
    next.apply(null, [].slice.call(repeat_args))
  };
}

const gen_say   = socket => string => socket.write(sty.parse(string + '\r\n'));
const gen_write = socket => string => socket.write(sty.parse(string));

const EventUtil = {
  gen_next,
  gen_repeat,
  gen_say,
};

module.exports.EventUtil = EventUtil;
