/* jshint node:true, esnext:true */
'use strict';

let session = require('..').session();

session.configure({
  host: 'localhost',
  port: 4000
});

session.trigger(`^By what name do you wish to be known?`, function() {
  // Read the next line from the client for the character name then emit
  // an event
  session.read(function(input) {
    console.log("Read input:", input);
    session.emit('username', input);
  });

  return "WHAT'S NAME PRECIOUS?? ";
});

module.exports = session;
