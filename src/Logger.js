const winston = require('winston');
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
  'timestamp':true
});

class Logger {

  static getLevel() {
    return winston.level || process.env['LOG_LEVEL'] || 'debug';
  }

  static setLevel(level) {
    winston.level = level;
  }

  /*
    Medium priority logging, default.
  */
  static log(...messages) {
    winston.log('info', ...messages);
  }

  /*
    Appends red "ERROR" to the start of logs.
    Highest priority logging.
  */
  static error(...messages) {
    winston.log('error', ...messages);
  }

  /*
    Less high priority than error, still higher visibility than default.
  */
  static warn(...messages) {
    winston.log('warn', ...messages);
  }

  /*
    Lower priority logging.
    Only logs if the environment variable is set to VERBOSE.
  */
  static verbose(...messages) {
    winston.log('verbose', ...messages)
  }

  //TODO: Be able to set and deactivate file logging via a server command.
  static setFileLogging(filename) {
    winston.add(winston.transports.File, { filename });
  }

  static deactivateFileLogging() {
    winston.remove(winston.transports.File);
  }

}

module.exports = Logger;
