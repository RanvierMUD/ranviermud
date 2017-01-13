'use strict';

const sty = require('sty');
const util = require('util');

/**
 * Helper for advancing staged events
 * @param string stage
 * @param object firstarg Override for the default arg
 */
function genNext(event) {
  /**
   * Move to the next stage of a staged event
   * @param Socket|Player socket     Either a Socket or Player on which emit() will be called
   * @param string        nextstage
   * @param ...
   */
  return function (socket, nextstage) {
    socket.emit(event, ...arguments);
  }
}

/**
 * Helper for repeating staged events
 * @param Array repeat_args
 * @return function
 */
function genRepeat(repeatArgs, next) {
  return function () {
    next(...repeatArgs);
  };
}

const genWrite = socket => string => socket.write(sty.parse(string));
const genSay   = socket => string => socket.write(sty.parse(string + '\r\n'));

module.exports =  {  
  genNext,
  genRepeat,
  genSay,
  genWrite
};
