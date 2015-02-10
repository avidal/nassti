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

  console.log("[MUD->]", pretty(chunk));

  // eslint doesn't like it when i do the let in the for, for some reason.
  let entry;
  for(entry of this.session.triggers) {
    let id = entry[0];
    let trigger = entry[1];
    let rx = trigger[0];
    let cb = trigger[1];
    let opts = trigger[2];
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
        this.session.triggers.delete(id);
      }
    }
  }

  this.push(line);
  done();

};

module.exports = TriggerStream;
