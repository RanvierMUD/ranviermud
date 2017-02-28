const winston = require('winston');

class Logger {

  static get level() {
    return process.env['LOG_LEVEL'] || 'info';
  }

  static log(...messages) {
    winston.log(this.level, ...messages);
  }

  /*
    Appends "info" to the start of logs.
  */
  static info(...messages) {
    winston.log('info', ...messages);
  }

  static error(...messages) {
    winston.log('error', ...messages);
  }

  static verbose(...messages) {
    if (this.level === 'verbose') {
      winston.log('verbose', ...messages)
    }
  }

}

module.exports = Logger;
