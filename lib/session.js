"use strict";

const EventEmitter = require("events").EventEmitter;
const inherits = require("util").inherits;

const _ = require("lodash");


let Session = function() {
  this.aliases = new Map();
  this.triggers = new Map();
  this.readers = [];
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

Session.prototype.path = function(steps) {
  // Path turns the list of provided steps into a generator that sends
  // successive steps directly to the game when calling `path.step()`
  let session = this;

  let Path = function(_steps) {
    this.steps = _steps.split(" ");
    this._step = 0;

    this.generator = (function *() {
      while (this._step < this.steps.length) {
        yield this.steps[this._step++];
      }
    }.bind(this))();

    console.log("Setup path with steps", this.steps);

  };

  inherits(Path, EventEmitter);

  Path.prototype.step = function() {
    let next = this.generator.next();
    if(next.value) {
      session.send(next.value + "\r\n");
      return;
    }

    this.emit("done");
  };

  Path.prototype.unstep = function() {
    if(this._step > 0) {
      this._step--;
    }
  };

  return new Path(steps);

};

module.exports = function() {
  return new Session();
};
