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


module.exports = session;
