'use strict';

const sty = require('sty');

/**
 * Helper methods for colored output during input-events
 */
const genWrite = socket => string => socket.write(sty.parse(string));
const genSay   = socket => string => socket.write(sty.parse(string + '\r\n'));

module.exports =  {  
  genSay,
  genWrite
};
