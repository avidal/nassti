/* jshint node:true, esnext:true */
'use strict';

const Transform = require('stream').Transform;

let Triggers = function(options) {
  Transform.call(this, options);
};

require('util').inherits(Triggers, Transform);

Triggers.prototype._transform = function(chunk, encoding, done) {
  this.push(chunk);
  done();
};

module.exports = Triggers;
