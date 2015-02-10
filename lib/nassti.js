"use strict";

const net = require("net");

const TelnetStream = require("./telnet-stream");
const TriggerStream = require("./trigger-stream");
const AliasStream = require("./alias-stream");

/**
 * Removes a module from the cache
 */
require.uncache = function (moduleName) {
    // Run over the cache looking for the files
    // loaded by the specified module name
    require.searchCache(moduleName, function (mod) {
        delete require.cache[mod.id];
    });

    // Remove cached paths to the module.
    // Thanks to @bentael for pointing this out.
    Object.keys(module.constructor._pathCache).forEach(function(cacheKey) {
        if (cacheKey.indexOf(moduleName) > 0) {
            delete module.constructor._pathCache[cacheKey];
        }
    });
};

/**
 * Runs over the cache to search for all the cached
 * files
 */
require.searchCache = function (moduleName, callback) {
    // Resolve the module identified by the specified name
    var mod = require.resolve(moduleName);

    // Check if the module has been resolved and found within
    // the cache
    if (mod && ((mod = require.cache[mod]) !== undefined)) {
        // Recursively go over the results
        (function run(m) {
            // Go over each of the module's children and
            // run over it
            m.children.forEach(function (child) {
                run(child);
            });

            // Call the specified callback providing the
            // found module
            callback(m);
        })(mod);
    }
};

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

module.exports.run = function(sessfile, port) {
  // sessfile is the name of a session file that can be directly required here,
  // as well as cleared out of the cache and required again if necessary.

  // When we catch a reload (SIGQUIT, ^\) we need to clear the require cache,
  // require the session file again, create new trigger and alias streams, then
  // rebuild the pipelines. The start function below is responsible for taking
  // a client, server, and session and wiring up everything appropriately.
  function start(client, mud, session) {
    // Make sure the client is paused while we setup the pipelines
    client.pause();

    // The session needs a handle directly to the mudsock so it can write raw
    // data directly to the mud from scripts
    session._out = mud;

    let telinp1 = new TelnetStream(client);
    let telinp2 = new TelnetStream(mud);

    let triggers = new TriggerStream(session);
    let aliases = new AliasStream(session);

    mud.pipe(telinp1).pipe(triggers).pipe(client);
    client.pipe(telinp2).pipe(aliases).pipe(mud);

  }

  function stop(client, mud) {
    // pause the client and mud, then unpipe them
    client.pause();
    mud.pause();

    client.unpipe();
    mud.unpipe();
  }

  // require the session file early so we can catch trigger problems before the
  // client connects
  require(sessfile);

  let server = net.createServer(function(client) {
    // Handle connections in here, this is where we setup the pipeline
    console.log("Got client connection.");

    let session = require(sessfile);

    let mudsock = net.connect({ host: session.host, port: session.port }, function() {
      console.log("Connected to mud");
      session.emit("connected");
    });

    start(client, mudsock, session);

    process.stdin.resume();
    process.on("SIGQUIT", function() {
      console.log("Caught quit!");
      stop(client, mudsock);

      require.uncache(sessfile);

      process.nextTick(function() {
        console.log("Restarting..");
        session = require(sessfile);
        start(client, mudsock, session);
      });
    });

  });

  server.listen(port, function() {
    console.info(`Listening on port ${port}`);
  });

};
