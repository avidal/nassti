/* jshint node:true, esnext:true */
'use strict';

let session = require('..').session();

session.configure({
  host: 'localhost',
  port: 4000
});

session.trigger(/^By what name do you wish to be known?/, function() {
  // Read the next line from the client for the character name then emit
  // an event
  session.read(function(input) {
    session.emit('username', input);
    if(input.toLowerCase().trim() === "alex") {
      session.send("test\r\n");
    }
  });

  return "WHAT'S NAME PRECIOUS?? ";
});

session.trigger(/^(\d+)H (\d+)M (\d+)V > $/, function(line, match) {
  session.emit('prompt', { hp: match[1], mp: match[2], mv: match[3] });
});

session.trigger(/^\x1B\[0;36m([^\[][^\r]+)\x1B\[0m$/m, function(line, match) {
  let room = match[1];
  // This is an overly greedy regex and can match things that aren't room
  // names, so do a quick sanity check
  if(room.indexOf('speaks from the') !== -1) {
    return;
  }

  // Now setup a one-time trigger to look for the exit line
  session.trigger(/^\x1B\[0;36m\[ (?:obvious exits|Exits): ([^\]]*)\]\x1B\[0m$/m, function(line, match) {
    let exits = match[1].split(' ');
    console.log("Found room:", room, "with exits:", exits);
    session.emit('room', { name: room, exits: exits });
  }, { once: true });
});


module.exports = session;
