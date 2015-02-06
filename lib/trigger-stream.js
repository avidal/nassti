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

  // If our line currently ends with \r\n, we want to ensure that's what's
  // coming out on the other side
  let hasNL = line.endsWith("\r\n");

  let trigs = Object.keys(this.session.triggers);

  trigs.forEach(function(pattern) {
    if((new RegExp(pattern, 'm')).exec(line)) {
      let rv = this.session.triggers[pattern](line);
      if(rv !== undefined) {
        // If the trigger function returns anything, then that is the new line
        // and we use it for the remaining trigger functions
        line = rv;
      }
    }
  }.bind(this));

  if(hasNL && line.endsWith("\r\n") === false) {
    line = line + "\r\n";
  }

  this.push(line);
  done();

};

module.exports = TriggerStream;
