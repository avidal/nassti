/* jshint node:true, esnext:true */
'use strict';

let session = require('..').session();

session.configure({
  host: 'localhost',
  port: 4000
});

module.exports = session;
