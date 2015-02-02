/* jshint node:true, esnext:true */
'use strict';

const Transform = require('stream').Transform;

let TriggerStream = function(session, options) {
  this.session = session;
  Transform.call(this, options);
};

require('util').inherits(TriggerStream, Transform);

TriggerStream.prototype._transform = function(chunk, encoding, done) {
  // Iterate over all of the triggers in the session and see if one matches
  // this chunk
  let line = chunk.toString('ascii');
  let trigs = Object.keys(this.session.triggers);
  trigs.forEach(function(pattern) {
    if((new RegExp(pattern, 'm')).exec(line)) {
      this.session.triggers[pattern](line);
    }
  }.bind(this));
  this.push(chunk);
  done();
};

module.exports = TriggerStream;
