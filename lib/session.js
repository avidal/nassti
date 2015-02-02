/* jshint node:true, esnext:true */
'use strict';

const EventEmitter = require('events').EventEmitter;
const inherits = require('util').inherits;

let Session = function() {};
inherits(Session, EventEmitter);

Session.prototype.configure = function(options) {
  this.host = options.host;
  this.port = options.port;
};

module.exports = function() {
  return new Session();
};
