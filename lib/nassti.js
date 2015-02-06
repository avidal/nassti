/* jshint node:true, esnext:true */
'use strict';

const net = require('net');
const stream = require('stream');
const util = require('util');

const colors = require('colors/safe');

const pretty = require('./util').pretty;
const TelnetStream = require('./telnet-stream');
const TriggerStream = require('./trigger-stream');
const AliasStream = require('./alias-stream');

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

let run = module.exports.run = function(session, port) {
  let server = net.createServer(function(client) {
    // Handle connections in here, this is where we setup the pipeline
    console.log("Got client connection.");

    // Pause the client input immediately. Once we setup the pipeline below it'll
    // unpause automatically
    client.pause();

    let mudsock = net.connect({ host: session.host, port: session.port }, function() {
      console.log("Connected to mud");
      session.emit('connected');
    });

    // The session needs a handle directly to the mudsock so it can write raw
    // data directly to the mud from scripts
    session._out = mudsock;

    let telinp1 = new TelnetStream(client);
    let telinp2 = new TelnetStream(mudsock);

    let triggers = new TriggerStream(session);
    let aliases = new AliasStream(session);

    mudsock.pipe(telinp1).pipe(triggers).pipe(client);
    client.pipe(telinp2).pipe(aliases).pipe(mudsock);
  });

  server.listen(port, function() {
    console.info(`Listening on port ${port}`);
  });

};
