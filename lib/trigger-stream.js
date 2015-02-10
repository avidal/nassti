"use strict";

const Transform = require("stream").Transform;

const pretty = require("./util").pretty;

let TriggerStream = function(session, options) {
  this.session = session;
  Transform.call(this, options);
};

require("util").inherits(TriggerStream, Transform);

TriggerStream.prototype._transform = function(chunk, encoding, done) {
  // Iterate over all of the triggers in the session and see if one matches
  // this chunk
  let line = chunk.toString("ascii");

  // If our line currently ends with \r\n, we want to ensure that's what's
  // coming out on the other side
  let hasNL = line.endsWith("\r\n");

  // An array of trigger indexes that will be removed after iterating over the
  // list
  let toRemove = [];

  console.log("[MUD->]", pretty(chunk));

  for(let i = 0; i < this.session.triggers.length; i++) {
    let trig = this.session.triggers[i];
    let rx = trig[0];
    let cb = trig[1];
    let opts = trig[2];
    let match = rx.exec(line);
    if(match) {
      let rv = cb(line, match);
      if(rv !== undefined) {
        // If the trigger function returns anything, then that is the new line
        // and we use it for the remaining trigger functions
        if(hasNL && rv.endsWith("\r\n") === false) {
          line = rv + "\r\n";
        } else {
          line = rv;
        }

        console.info("[TRIG]", "Replacing with", line);

      }

      if(opts && opts.once) {
        toRemove.push(i);
      }
    }
  }

  // For each index in toRemove, pop it out; starting from the last one
  if(toRemove.length) {
    for(let i = toRemove.length - 1; i >= 0; i--) {
      let idx = toRemove[i];
      this.session.triggers.splice(idx, 1);
    }
  }

  this.push(line);
  done();

};

module.exports = TriggerStream;
