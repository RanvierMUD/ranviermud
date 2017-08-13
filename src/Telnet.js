'use strict';

const EventEmitter = require('events'),
    net = require('net');
const TransportStream = require('./TransportStream');

// @TODO: Refactor this to be its one node module

// see: arpa/telnet.h
const IAC     = 255;
const DONT    = 254;
const DO      = 253;
const WONT    = 252;
const WILL    = 251;
const SB      = 250;
const SE      = 240;
const GA      = 249;
const EOR     = 239;

const OPT_ECHO = 1;
const OPT_EOR = 25;

/**
 * The following is an intentionally dismissive telnet parser,
 * it basically ignores anything the client tells it to do. Its
 * only purpose is to know how to parse negotiations and swallow
 * them. It can, however, issue commands such as toggling echo
 */
class TelnetStream extends TransportStream
{
  constructor(opts) {
    super();
    this.isTTY = true;
    this.env = {};
    this.stream = null;
    this.maxInputLength = opts.maxInputLength || 512;
    this.echoing = true;
    this.gaMode = null;
  }

  get readable() {
    return this.stream.readable;
  }

  get writable() {
    return this.stream.writable;
  }

  address() {
    return this.stream && this.stream.address();
  }

  end(string, enc) {
    this.stream.end(string, enc);
  }

  write(data, encoding) {
    if (!Buffer.isBuffer(data)) {
      data = new Buffer(data, encoding);
    }

    // escape IACs by duplicating
    let iacs = 0;
    for (const val of data.values()) {
      if (val === IAC) {
        iacs++;
      }
    }

    if (iacs) {
      let b = new Buffer(data.length + iacs);
      for (let i = 0, j = 0; i < data.length; i++) {
        b[j++] = data[i];
        if (data[i] === IAC) {
          b[j++] = IAC;
        }
      }
    }

    try {
      if (!this.stream.ended && !this.stream.finished) {
        this.stream.write(data);
      }
    } catch (e) {
      console.log(e);
    }
  }

  setEncoding(encoding) {
    this.stream.setEncoding(encoding);
  }

  pause() {
    this.stream.pause();
  }

  resume() {
    this.stream.resume();
  }

  destroy() {
    this.stream.destroy();
  }

  /**
   * Execute a telnet command
   * @param {number}       willingness DO/DONT/WILL/WONT
   * @param {number|Array} command     Option to do/don't do or subsequence as array
   */
  telnetCommand(willingness, command) {
    let seq = [IAC, willingness];
    if (Array.isArray(command)) {
      seq.push.apply(seq, command);
    } else {
      seq.push(command);
    }

    this.stream.write(new Buffer(seq));
  }

  executeToggleEcho() {
    this.echoing = !this.echoing;
    this.telnetCommand(this.echoing ? WONT : WILL, OPT_ECHO);
  }

  executeGoAhead() {
    if (!this.gaMode) {
      return;
    }

    this.stream.write(new Buffer([IAC, this.gaMode]));
  }

  attach(connection) {
    this.stream = connection;
    let inputbuf = new Buffer(this.maxInputLength);
    let inputlen = 0;

    connection.on('error', err => console.error('Telnet Stream Error: ', err));

    this.stream.write("\r\n");
    connection.on('data', (databuf) => {
      databuf.copy(inputbuf, inputlen);
      inputlen += databuf.length;

      // immediately start consuming data if we begin receiving normal data
      // instead of telnet negotiation
      if (connection.fresh && databuf[0] !== IAC) {
        connection.fresh = false;
      }

      databuf = inputbuf.slice(0, inputlen);
      // fresh makes sure that even if we haven't gotten a newline but the client
      // sent us some initial negotiations to still interpret them
      if (!databuf.toString().match(/[\r\n]/) && !connection.fresh) {
        return;
      }

      // If multiple commands were sent \r\n separated in the same packet process
      // them separately. Some client auto-connect features do this
      let bucket = [];
      for (let i = 0; i < inputlen; i++) {
        if (databuf[i] !== 10) { // \n
          bucket.push(databuf[i]);
        } else {
          this.input(Buffer.from(bucket));
          bucket = [];
        }
      }

      if (bucket.length) {
        this.input(Buffer.from(bucket));
      }

      inputbuf = new Buffer(this.maxInputLength);
      inputlen = 0;
    });

    connection.on('close', _ => {
      this.emit('close');
    });
  }

  /**
   * Parse telnet input stream, swallowing any negotiations
   * and emitting clean, fresh data
   *
   * @param {Buffer} inputbuf
   */
  input(inputbuf) {
    // strip any negotiations
    let cleanbuf = Buffer.alloc(inputbuf.length);
    let i = 0;
    let cleanlen = 0;
    while (i < inputbuf.length) {
      if (inputbuf[i] !== IAC) {
        cleanbuf[cleanlen++] = inputbuf[i++];
        continue;
      }

      // We don't actually negotiate, we don't care what the clients will or wont do
      // so just swallow everything inside an IAC sequence
      // i += (number of bytes including IAC)
      const cmd = inputbuf[i + 1];
      const opt = inputbuf[i + 2];
      switch (cmd) {
        case DO:
          switch (opt) {
            case OPT_EOR:
              this.gaMode = EOR;
              break;
            default:
              this.telnetCommand(WONT, opt);
              break;
          }
          i += 3;
          break;
        case DONT:
          switch (opt) {
            case OPT_EOR:
              this.gaMode = GA;
              break;
          }
          i += 3;
          break;
        case WILL:
          /* falls through */
        case WONT:
          i += 3;
          break;
        case SB:
          // swallow subnegotiations
          i += 2;
          let sublen = 0;
          while (inputbuf[i++] !== SE) {sublen++;}
          break;
        default:
          i += 2;
          break;
      }
    }

    if (this.stream.fresh) {
      this.stream.fresh = false;
      return;
    }
    this.emit('data', cleanbuf.slice(0, cleanlen - 1));
  }
}

class TelnetServer
{
  /**
   * @param {object}   streamOpts options for the stream @see TelnetStream
   * @param {function} listener   connected callback
   */
  constructor(streamOpts, listener) {
    this.netServer = net.createServer({}, (connection) => {
      connection.fresh = true;
      let stream = new TelnetStream(streamOpts);
      stream.attach(connection);
      stream.telnetCommand(WILL, OPT_EOR);
      this.netServer.emit('connected', stream);
    });

    this.netServer.on('connected', listener);
    this.netServer.on('error', error => {
      console.error('Error: ', error);
      console.error('Stack Trace: ', error.stack);
    });

    this.netServer.on('uncaughtException', error => {
      console.error('Uncaught Error: ', error);
      console.error('Stack Trace: ', error.stack);
    });
  }
}

exports.TelnetServer = TelnetServer;

// vim:ts=2:sw=2:et:
