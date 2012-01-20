/* A Telnet Protocol Listener.
 * By Wez Furlong.
 * Copyright (c) 2011 Message Systems, Inc.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in
 *    the documentation and/or other materials provided with the
 *    distribution.
 * 3. The name of the copyright holders or contributors may not be used
 *    to endorse or promote products derived from this software without
 *    specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS ``AS IS''
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDERS OR CONTRIBUTORS
 * BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
 * THE POSSIBILITY OF SUCH DAMAGE.
 */

/*
 * Made more challenging by the lack of OOB support in Node.
 */

/* Other stuff to look at:
 * can we use this with the readline interface? --> no, it assumes tty,
 * which assumes only one tty stream attached to stdin.
 */

var events = require('events'),
    util = require('util'),
    zlib = require('zlib'),
    net = require('net');

var IAC     = 255; // interpret as command
var DONT    = 254; // you are not to use option
var DO      = 253; // please use option
var WONT    = 252; // I won't use option
var WILL    = 251; // I will use option
var SB      = 250; // sub-negotiation
var GA      = 249; // Go-ahead
var EL      = 248; // Erase line
var EC      = 247; // Erase character
var AYT     = 246; // Are you there?
var AO      = 245; // Abort output (but let prog finish)
var IP      = 244; // Interrupt (permanently)
var BREAK   = 243;
var DM      = 242; // Data mark
var NOP     = 241;
var SE      = 240; // End sub-negotiation
var EOR     = 239; // End of record (transparent mode)
var ABORT   = 238; // Abort process
var SUSP    = 237; // Suspend process
var EOF     = 236; // End of file
var SYNCH   = 242;

var OPT_BINARY            = 0; // RFC 856
var OPT_ECHO              = 1; // RFC 857
var OPT_SUPPRESS_GO_AHEAD = 3; // RFC 858
var OPT_STATUS            = 5; // RFC 859
var OPT_TIMING_MARK       = 6; // RFC 860
var OPT_TTYPE             = 24; // RFC 930, 1091
var OPT_WINDOW_SIZE       = 31; // RFC 1073
var OPT_LINE_MODE         = 34; // RFC 1184
var OPT_NEW_ENVIRON       = 39; // RFC 1572
var OPT_COMPRESS2         = 86; // http://www.zuggsoft.com/zmud/mcp.htm

var TELQUAL_IS   = 0;
var TELQUAL_SEND = 1;

/* A telnet protocol stream.
 * Emits processed data:
 *  'data' -> what the peer sent
 *  other  -> telnet protocol command information
 */
function TelnetStream()
{
  events.EventEmitter.call(this);
  this.isTTY = true;
  this.env = {};

  this.__defineGetter__('readable', function() {
    return this.stream.readable;
  });
  this.__defineGetter__('writable', function() {
    return this.stream.writable;
  });
}

util.inherits(TelnetStream, events.EventEmitter);

/* "implement" the readable and writable streams interfaces */
TelnetStream.prototype.end = function (string, enc) {
  this.stream.end(string, enc);
};

TelnetStream.prototype.write = function (data, encoding) {
  if (!Buffer.isBuffer(data)) {
    data = new Buffer(data, encoding);
  }

  /* look for and escape IAC */
  var i;
  var iacs = 0;
  for (i = 0; i < data.length; i++) {
    if (data[i] == IAC) {
      iacs++;
    }
  }

  if (iacs) {
    var b = new Buffer(data.length + iacs);
    var j;
    for (i = 0, j = 0; i < data.length; i++) {
      b[j++] = data[i];
      if (data[i] == IAC) {
        b[j++] = IAC;
      }
    }
    data = b;
  }

  if (this.deflate) {
    this.deflate.write(data);
    this.deflate.flush();
  } else {
    this.stream.write(data);
  }
};
TelnetStream.prototype.setEncoding = function (enc) {
  this.stream.setEncoding(enc);
};
TelnetStream.prototype.pause = function () {
  this.stream.pause();
};
TelnetStream.prototype.resume = function () {
  this.stream.resume();
};
TelnetStream.prototype.destroy = function () {
  this.stream.destroy();
};
TelnetStream.prototype.destroySoon = function () {
  this.stream.destroySoon();
};
TelnetStream.prototype.pipe = function (dest, opts) {
  util.pump(this, dest);
  return dest;
};

TelnetStream.prototype.telnetCommand = function (dodontwill, command)
{
  var bytes = [IAC, dodontwill];
  if (command instanceof Array) {
    bytes.push.apply(bytes, command);
  } else {
    bytes.push(command);
  }
  var b = new Buffer(bytes);
  this.stream.write(b);
}

function call_next_neg(telnet)
{
  if (telnet.neg_cb) {
    telnet.neg_cb.call(telnet);
  }
}

// Parse RFC 1572 "IS" or "INFO" environment responses
// and set telnet.env[name] = value for each variable
function parse_env(telnet, buf)
{
  var IS      = 0,
      SEND    = 1,
      INFO    = 2,
      VAR     = 0,
      VALUE   = 1,
      ESC     = 2,
      USERVAR = 3;

  var changed = {};

  if (buf[0] != IS && buf[0] != INFO) {
    throw new Error('env parse: expected IS or INFO, got %d', buf[0]);
  }
  var b = buf.slice(1);
  while (b.length) {
    var t = b[i]; // type
    var i;
    var name = '';
    var value = null;
    // Look for VALUE or type
    for (i = 1; i < b.length; i++) {
      // Escaped?
      if (b[i] == ESC) {
        i++;
        name += b.toString('ascii', i + 1, i+2);
        continue;
      }
      if (b[i] == VALUE || b[i] == VAR || b[i] == USERVAR) {
        break;
      }
      name += b.toString('ascii', i, i+1);
    }
    if (b[i] == VALUE) {
      i++;
      value = '';
      while (i < b.length) {
        if (b[i] == ESC) {
          value += b.toString('ascii', i + 1, i + 2);
          i += 2;
          continue;
        }
        if (b[i] == VAR || b[i] == USERVAR) {
          break;
        }
        value += b.toString('ascii', i, i + 1);
        i++;
      }
    }
    telnet.env[name] = value;
    changed[name] = value;
    if (i < buf.length) {
      b = b.slice(i);
    } else {
      break;
    }
  }
  telnet.emit('environment', changed);
}

TelnetStream.prototype.processSB = function (buf)
{
  var telnet = this;
  var i;

  var seen_iac = false;

  /* we're in a sub-negotiation; collect data until we reach SE */
  /* This code looks a little weird; I expect it to be modified to
   * handle looking across buffer boundaries at some point */
  for (i = 0; i < buf.length; i++) {
    if (buf[i] == IAC) {
      seen_iac = true;
    } else if (buf[i] == SE && seen_iac) {
      // Got it; all buffers up until now comprise the SB data payload
      var pl = buf.slice(0, i - 1);

      this.state = 0;
      switch (this.neg_opt) {
        case OPT_WINDOW_SIZE:
          this.windowSize = [pl.readInt16BE(0), pl.readInt16BE(2)];
          this.emit('resize', this.windowSize[0], this.windowSize[1]);
          break;

        case OPT_NEW_ENVIRON:
          parse_env(telnet, pl);
          break;

        case OPT_TTYPE:
          this.term = pl.toString('ascii', 1);
          /* fall through */
        default:
          this.emit('negotiated', this.neg_opt, pl);
      }

      if (i + 2 <= buf.length) {
        var remain = buf.slice(i + 2);
        this.processIncomingData(remain);
      }

      call_next_neg(telnet);
      return;

    } else {
      seen_iac = false;
    }
  }

  throw new Error("need to buffer the buffer!");
}

TelnetStream.prototype.processIncomingData = function (buf)
{
  var telnet = this;

  if (!buf.length) {
    return;
  }

  // console.log(buf.length, buf);

  if (this.state == SB) {
    return this.processSB(buf);
  }

  var i;
  
  /* base state; accepting text and looking for IAC */

  function emitData() {
    if (i > 0) {
      var s = buf.slice(0, i);
      telnet.emit('data', s);

      buf = buf.slice(i);
      i = 0;
    }
  }

  function eat(n) {
    buf = buf.slice(n);
    i = 0;
  }

  /* beware: emitData resets both `buf' and `i'! */
  i = 0;
  while (i < buf.length) {
    if (buf[i] != IAC) {
      i++;
      continue;
    }

    /* any data ahead of this? */
    emitData();

    var cmd = buf[i + 1];
    if (typeof cmd !== 'undefined')
    switch (cmd) {
      case EOF:
      case IP:
        this.emit('interrupt');
        eat(2);
        break;
      case SUSP:
        this.emit('suspend');
        eat(2);
        break;

      case SB:
        // Option being negotiated
        this.neg_opt = buf[i+2];
        this.state = SB;
        return this.processSB(buf.slice(i+3));

      case WILL:
        var opt = buf[i+2];
        //console.log("will", opt);
        switch (opt) {
          case OPT_TTYPE:
            // They will, so we need to ask for it
            this.telnetCommand(SB, [OPT_TTYPE, TELQUAL_SEND, IAC, SE]);
            break;
          case OPT_NEW_ENVIRON:
            this.telnetCommand(SB, [OPT_NEW_ENVIRON, TELQUAL_SEND, IAC, SE]);
            break;
          case OPT_COMPRESS2:
            // TinTin++ and other MUD clients support this
            this.telnetCommand(SB, [OPT_COMPRESS2, IAC, SE]);
            this.deflate = zlib.createDeflate({level: 9});
            this.deflate.pipe(this.stream);
            call_next_neg(this);
            break;
          case OPT_WINDOW_SIZE:
            // they will send the window size via SB
            // sbiddle: Or maybe they won't
            call_next_neg(this);
            break;
          case OPT_BINARY:
            this.binary = true;
            /* fall through */
          default:
            this.emit('will', opt);
            call_next_neg(this);
        }
        eat(3);
        break;
      case WONT:
        this.emit('wont', buf[i+2]);
        eat(3);
        call_next_neg(this);
        break;
      case DO:
        var opt = buf[i+2];
        switch (opt) {
          // telnet(1) sends DO OPT_TIMING_MARK after an interrupt
          case OPT_TIMING_MARK:
            /* pong! */
            this.telnetCommand(WILL, OPT_TIMING_MARK);
            break;
          // they want us to do binary
          case OPT_BINARY:
            this.binary = true;
            this.telnetCommand(WILL, OPT_BINARY);
            break;
          default:
            this.telnetCommand(WONT, opt);
            this.emit('do', opt);
        }
        eat(3);
        break;
      case DONT:
        var opt = buf[i+2];
        this.emit('dont', opt);
        this.telnetCommand(WONT, opt);
        eat(3);
        break;
      default:
        console.log("unknown opcode %d", buf[i+1]);
        eat(2);
    }
    else { eat(1); call_next_neg(this); }
  }

  if (buf.length) {
    emitData();
  }
};

TelnetStream.prototype.attachStream = function (sock)
{
  var telnet = this;

  telnet.stream = sock;
  var buftext = new Buffer(512);
  var buflen  = 0;

  sock.on('data', function (buf) {
    buf.copy(buftext, buflen);
    buflen += buf.length;
    if ((!buf.toString().match(/[\r\n]/))) {
      return;
    }
    telnet.processIncomingData(buftext.slice(0, buflen));
    buftext = new Buffer(512);
    buflen = 0;
  });
  sock.on('close', function () {
    telnet.emit('close');
  });
}

function Server(connectionListener)
{
  var s;
  
  function connected(c)
  {
    var stm = new TelnetStream();
    stm.attachStream(c);

    /* query the sorts of things that a server might be interested in,
     * and then trigger the connection event */
    var opts = [];// OPT_TTYPE, OPT_WINDOW_SIZE, OPT_NEW_ENVIRON, OPT_BINARY, OPT_COMPRESS2];

    function neg_next() {
      if (!opts.length) {
        stm.neg_cb = null;
        s.emit('connected', stm);
        return;
      }
      var opt = opts.shift();
      stm.telnetCommand(DO, opt);
    }

    stm.neg_cb = neg_next;
    neg_next();
  }

  s = net.createServer({}, connected);

  s.on('connected', connectionListener);

  return s;
}

exports.Server = Server;

// vim:ts=2:sw=2:et:
