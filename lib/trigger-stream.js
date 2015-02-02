/* jshint node:true, esnext:true */
'use strict';

const Transform = require('stream').Transform;

let TriggerStream = function(options) {
  Transform.call(this, options);
};

require('util').inherits(TriggerStream, Transform);

TriggerStream.prototype._transform = function(chunk, encoding, done) {
  this.push(chunk);
  done();
};

module.exports = TriggerStream;
