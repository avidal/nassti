/* jshint node:true, esnext:true */
'use strict';

const EventEmitter = require('events').EventEmitter;
const inherits = require('util').inherits;

let Session = function() {
  this.aliases = {};
  this.triggers = [];
  this.readers = [];
};
inherits(Session, EventEmitter);

Session.prototype.configure = function(options) {
  this.host = options.host;
  this.port = options.port;
};

Session.prototype.trigger = function(pattern, callback) {
  console.log("Registering trigger", pattern);
  // TODO: Return a trigger ID that can later be used to deregister
  this.triggers.push([pattern, callback]);
};

Session.prototype.alias = function(alias, callback) {
  console.log("Registering alias", alias);
  // TODO: Return an alias ID that can later be used to deregister
  this.aliases[alias] = callback;
};

Session.prototype.read = function(callback) {
  // The read method lets a script wait until the next line of input comes from
  // the client, and it receives that line
  this.readers.push(callback);
};

Session.prototype.send = function(input) {
  // Sends the provided input directly to the mud, bypassing the alias engine
  if(!this._out) {
    console.error("Not connected.");
    return;
  }

  console.log(this._out.write(input));

};

module.exports = function() {
  return new Session();
};
