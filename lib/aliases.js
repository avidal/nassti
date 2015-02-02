/* jshint node:true, esnext:true */
'use strict';

const Transform = require('stream').Transform;

let Aliases = function(options) {
  Transform.call(this, options);
};

require('util').inherits(Aliases, Transform);

Aliases.prototype._transform = function(chunk, encoding, done) {
  this.push(chunk);
  done();
};

module.exports = Aliases;
