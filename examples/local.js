/* jshint node:true, esnext:true */
'use strict';

let session = require('..').session();

session.configure({
  host: 'localhost',
  port: 4000
});

session.trigger(`^By what name`, function(line, done) {
  console.log("Matched on", line);
});

module.exports = session;
