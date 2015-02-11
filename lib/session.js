"use strict";

const EventEmitter = require("events").EventEmitter;
const inherits = require("util").inherits;

const _ = require("lodash");


let Session = function() {
  this.aliases = new Map();
  this.triggers = new Map();
  this.timers = new Map();
  this.readers = [];

  this.emitTick = function() {
    this.emit("tick");
  }.bind(this);

};
inherits(Session, EventEmitter);

Session.prototype.configure = function(options) {
  this.host = options.host;
  this.port = options.port;
};

Session.prototype.trigger = function(pattern, callback, options) {
  console.log("Registering trigger", pattern);
  const id = _.uniqueId("TRIG-");
  this.triggers.set(id, [pattern, callback, options]);
  return id;
};

Session.prototype.removeTrigger = function(id) {
  this.triggers.delete(id);
};

Session.prototype.alias = function(alias, callback) {
  if((alias instanceof RegExp) === false) {
    alias = new RegExp(alias);
  }

  console.log("Registering alias", alias);
  this.aliases.set(alias, callback);
};

Session.prototype.timer = function(name, interval, callback) {
  const id = _.uniqueId("TIMER-");

  // Create a timer function with reset and fire methods
  let Timer = function(delay, cb) {
    this.delay = delay;
    this.cb = cb;
    this.timeout = null;
  };

  Timer.prototype.fire = function() {
    this.cb();
    this.reset();
  };

  Timer.prototype.reset = function() {
    if(this.timeout) {
      clearTimeout(this.timeout);
    }

    this.timeout = setTimeout(this.delay, this.fire.bind(this));
  };

  let timer = new Timer(interval, callback);
  this.timers.set(id, timer);
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
