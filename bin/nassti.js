#!/usr/bin/env node
/*eslint no-process-exit: 0 */
"use strict";

const VERSION = require("../package.json").version;
let program = require("commander");
let resolve = require("resolve");

let nassti = require("../lib/nassti");

program
  .version(VERSION);

program
  .command("run <session>")
  .description("Run nassti using the provided session name or path")
  .option("-p, --port [port]", "Which port to listen on [2222]", 2222)
  .action(function(sessfile, options) {
    try {
      sessfile = resolve.sync(sessfile, { basedir: process.cwd() });
    } catch(e) {
      console.error("Could not load session", sessfile);
      process.exit();
    }

    let session = require(sessfile);

    console.log("Running with session", sessfile);
    nassti.run(session, options.port);

  });

program.parse(process.argv);

if(program.args.length === 0) {
  program.help();
  process.exit();
}
