'use strict';

const Transform = require('stream').Transform;

let AliasStream = function(session, options) {
  this.session = session;
  Transform.call(this, options);
};

require('util').inherits(AliasStream, Transform);

AliasStream.prototype._transform = function(chunk, encoding, done) {
  this.push(chunk);

  this.session.readers.forEach(function(rdr) {
    rdr(chunk.toString('ascii'));
  });

  this.session.readers = [];

  done();
};

module.exports = AliasStream;
