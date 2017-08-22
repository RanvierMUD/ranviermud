'use strict';

const winston = require('winston');

// Reset Console transport and configure it to include ISO timestamp.
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
  'timestamp':true
});

const logDir = __dirname + '/../log/';
const logExt = '.log';

/**
 * Wrapper around Winston
 */
class Logger {

  static getLevel() {
    return winston.level || process.env.LOG_LEVEL || 'debug';
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
    winston.log('verbose', ...messages);
  }

  //TODO: Be able to set and deactivate file logging via a server command.
  static setFileLogging(filename) {
    filename = logDir + filename;
    if (!filename.endsWith(logExt)) {
      filename += logExt;
    }
    console.log("Adding file logging at " + filename);
    winston.add(winston.transports.File, { filename, timestamp: true });
  }

  static deactivateFileLogging() {
    winston.remove(winston.transports.File);
  }

  static enablePrettyErrors() {
    const longjohn = require('longjohn');
    const pe = require('pretty-error').start();
    pe.skipNodeFiles(); // Ignore native node files in stacktrace.
  }

}

module.exports = Logger;
