/* jshint node:true, esnext:true */
'use strict';

const EventEmitter = require('events').EventEmitter;
const inherits = require('util').inherits;

let Session = function() {
  this.triggers = {};
  this.aliases = {};
  this.readers = [];
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

Session.prototype.read = function(callback) {
  // The read method lets a script wait until the next line of input comes from
  // the client, and it receives that line
  this.readers.push(callback);
};

module.exports = function() {
  return new Session();
};
