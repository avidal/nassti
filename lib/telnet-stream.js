"use strict";

const stream = require("stream");
const util = require("util");

const IAC = 255;

let TelnetStream = function(sink) {
  // sink is a stream that can be written to when we're bypassing the stream
  this.sink = sink;

  // We consume into one of two buffers, depending on previous state

  // The first one is data that is determined to be a part of an IAC sequence,
  // including the IAC
  this.telnetBuffer = new Buffer(8192);

  // The second is data that is NOT part of an IAC sequence, which should go to
  // the client
  this.dataBuffer = new Buffer(8192);

  // In addition, we need to record an index into each buffer so we know how
  // far we've written and know what we need to do in order to flush properly
  // For instance, setting up a 10 byte buffer and only writing 2 bytes then
  // naively flushing the whole thing can end up with erroneous 8 bytes on the
  // end.
  // We reset telnetPtr when we flush the telnet buffer, and we reset dataPtr
  // when we flush the data buffer.
  this.telnetPtr = 0;
  this.dataPtr = 0;

  // As we iterate over the source bytes (in _transform) the reader function
  // will be called. Each reader function is responsible for consuming one
  // single byte and putting it into one of the two buffers and then returning
  // the next reader to use (which may be itself)
  // The default reader just reads a byte.
  this.reader = this.readByte;

  stream.Transform.call(this, {});

};

util.inherits(TelnetStream, stream.Transform);

TelnetStream.prototype.flushData = function() {
  this.push(this.dataBuffer.slice(0, this.dataPtr));
  this.dataPtr = 0;
};

TelnetStream.prototype.flushTelnet = function() {
  this.sink.write(this.telnetBuffer.slice(0, this.telnetPtr));
  this.telnetPtr = 0;
};

TelnetStream.prototype.readByte = function(ch) {
  // The byte reader just checks to see if the byte is an IAC or not

  if(ch === IAC) {
    // If we get an IAC then flush and reset the data buffer, then write the
    // IAC to the telnet buffer
    this.flushData();
    this.telnetBuffer.writeUInt8(ch, this.telnetPtr++);
    return this.readIac;
  }

  // Otherwise, write to the data buffer and return the same reader
  this.dataBuffer.writeUInt8(ch, this.dataPtr++);

  // Flush early if we read an LF so we can (ideally) process line-by-line
  if(ch === 0x0a) {
    this.flushData();
  }

  return this.readByte;

};

TelnetStream.prototype.readIac = function(ch) {
  // There are three scenarios after reading the first IAC:
  //  - Get another IAC, in which case we push both IACs to the client
  //  - Get telnet command with no options
  //  - Get a telnet command with options
  //  - Start a subnegotation

  // First, the terminal case
  if(ch === IAC) {
    // Rewind the telnet buffer, since we don't actually want to issue the IAC
    this.telnetPtr = 0;
    // Now write two IACs to the data buffer
    this.dataBuffer.writeUInt8(IAC, this.dataPtr++);
    this.dataBuffer.writeUInt8(IAC, this.dataPtr++);

    // And return the regular byte reader
    return this.readByte;
  }

  // If we got one of the non-option commands, then push into the telnet
  // buffer, flush it, and go back to the data reader
  if(ch >= 241 && ch <= 249) {
    this.telnetBuffer.writeUInt8(ch, this.telnetPtr++);
    this.flushTelnet();
    return this.readByte;
  }

  // If we got one of the commands with options (WILL,WONT,DONT,DO) then push
  // into the telnet buffer and return the option reader
  if(ch >= 251 && ch <= 254) {
    this.telnetBuffer.writeUInt8(ch, this.telnetPtr++);
    return this.readOption;
  }

  // If we got an IAC SB (subnegotation begin), then push into the telnet
  // buffer and return the subneg reader
  if(ch === 250) {
    this.telnetBuffer.writeUInt8(ch, this.telnetPtr++);
    return this.readSubneg;
  }
};

TelnetStream.prototype.readOption = function(ch) {
  // The option reader just puts the byte onto the telnetBuffer, flushes it,
  // then returns back to the byte reader
  this.telnetBuffer.writeUInt8(ch, this.telnetPtr++);
  this.flushTelnet();
  return this.readByte;
};

TelnetStream.prototype.readSubneg = function(ch) {
  // The subneg reader returns itself until it receives an SE (240), which
  // indicates the end of suboption negotation
  this.telnetBuffer.writeUInt8(ch, this.telnetPtr++);

  if(ch === 240) {
    this.flushTelnet();
    return this.readByte;
  }

  return this.readSubneg;
};

TelnetStream.prototype._transform = function transform(chunk, encoding, done) {
  // This transform stream is responsible for consuming, byte after byte, data
  // from the client or from the mud, extracting telnet options, and forwarding
  // them along to this.outchan. The reason is so that the rest of the nassti
  // code (the trigger and alias engines) don't have to deal with telnet
  // protocol implementation details.
  let reader = this.reader;

  for(let i = 0; i < chunk.length; i++) {
    let ch = chunk[i];

    reader = reader.call(this, ch);
  }

  // Before marking anything as done we want to flush and reset the data buffer
  // if we have anything
  if(this.dataPtr) {
    this.flushData();
  }

  done();

};

module.exports = TelnetStream;
