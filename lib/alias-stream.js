"use strict";

const Transform = require("stream").Transform;

let AliasStream = function(session, options) {
  this.session = session;
  Transform.call(this, options);
};

require("util").inherits(AliasStream, Transform);

AliasStream.prototype._transform = function(chunk, encoding, done) {
  let line = chunk.toString("ascii");

  // Iterate over the aliases and if one matches then call it and use its return
  // as the new line
  let entry;
  for(entry of this.session.aliases) {
    let alias = entry[0];
    let callback = entry[1];

    let match = alias.exec(line);
    if(match) {
      line = callback(line, match);
    }
  }

  // If the line doesn't end with \r\n, then add it
  if(line && line.endsWith("\r\n") === false) {
    console.log("Line", line, "doesn't end with CRLF");
    line = line + "\r\n";
  }

  // Push the line before calling any reader functions.
  if(line) {
    this.push(line);

    // And now process any registered reader functions
    let rdr;
    for(rdr of this.session.readers) {
      rdr(line);
    }

    this.session.readers = [];
  }

  done();
};

module.exports = AliasStream;
