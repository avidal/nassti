"use strict";

const EventEmitter = require("events").EventEmitter;
const inherits = require("util").inherits;

const _ = require("lodash");


let Session = function() {
  this.aliases = {};
  this.triggerRegistry = {};
  this.triggers = [];
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
  this.triggers.push([pattern, callback, options]);
  this.triggerRegistry[id] = this.triggers.length - 1;
  return id;
};

Session.prototype.removeTrigger = function(id) {
  let idx = this.triggerRegistry[id];

  // Remove it from the trigger list and then remove it from the registry
  this.triggers.splice(idx, 1);
  delete this.triggerRegistry[id];
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
