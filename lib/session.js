/* jshint node:true, esnext:true */
'use strict';

const EventEmitter = require('events').EventEmitter;
const inherits = require('util').inherits;

let Session = function() {
  this.triggers = {};
  this.aliases = {};
};
inherits(Session, EventEmitter);

Session.prototype.configure = function(options) {
  this.host = options.host;
  this.port = options.port;
};

Session.prototype.trigger = function(pattern, callback) {
  console.log("Registering trigger", pattern);
  this.triggers[pattern] = callback;
};

Session.prototype.alias = function(alias, callback) {
  this.aliases[alias] = callback;
};

module.exports = function() {
  return new Session();
};
