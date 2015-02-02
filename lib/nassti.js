/* jshint node:true, esnext:true */
'use strict';

const net = require('net');
const stream = require('stream');
const util = require('util');

const colors = require('colors/safe');

const TelnetStream = require('./telnet-stream');
const pretty = require('./util').pretty;

// We have two pipelines:
//  - mudsock -> triggers -> client
//  - client -> aliases -> mudsock
//
//  We setup the trigger and alias streams immediately, then start up a tcp
//  server for the client to connect. When the client connects we connect to
//  the MUD.
//
//  All telopts are dealt with out-of-band, so the scripting engine (trigger
//  and alias streams) only receives normal ANSI stuff.


let trigs = new stream.Transform();
trigs._transform = function transform(chunk, encoding, callback) {
  this.push(chunk);
  callback();
};

let aliases = new stream.Transform();
aliases._transform = function transform(chunk, encoding, callback) {
  this.push(chunk);
  callback();
};

module.exports.run = function(session, port) {
  let server = net.createServer(function(client) {
    // Handle connections in here, this is where we setup the pipeline
    console.log("Got client connection.");

    // Pause the client input immediately. Once we setup the pipeline below it'll
    // unpause automatically
    client.pause();

    let mudsock = net.connect({ host: session.host, port: session.port }, function() {
      console.log("Connected to mud");
    });

    let telinp1 = new TelnetStream(client);
    let telinp2 = new TelnetStream(mudsock);

    mudsock.pipe(telinp1).pipe(trigs).pipe(client);
    client.pipe(telinp2).pipe(aliases).pipe(mudsock);
  });

  server.listen(port, function() {
    console.info(`Listening on port ${port}`);
  });

};
