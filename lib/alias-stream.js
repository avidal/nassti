/* jshint node:true, esnext:true */
'use strict';

const Transform = require('stream').Transform;

let AliasStream = function(options) {
  Transform.call(this, options);
};

require('util').inherits(AliasStream, Transform);

AliasStream.prototype._transform = function(chunk, encoding, done) {
  this.push(chunk);
  done();
};

module.exports = AliasStream;
