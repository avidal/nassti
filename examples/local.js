"use strict";

let session = require("..").session();

session.configure({
  host: "localhost",
  port: 4000
});

session.trigger(/^By what name do you wish to be known?/, function() {
  // Read the next line from the client for the character name then emit
  // an event
  session.read(function(input) {
    session.emit("username", input);
    if(input.toLowerCase().trim() === "alex") {
      session.send("test\r\n");
    }
  });

  return "WHAT'S NAME PRECIOUS?? ";
});

session.on("username", function(username) {
  console.log("Got username", username);
});

session.trigger(/^(\d+)H (\d+)M (\d+)V > $/, function(line, match) {
  session.emit("prompt", { hp: match[1], mp: match[2], mv: match[3] });
});

session.trigger(/^\x1B\[0;36m([^\[][^\r]+)\x1B\[0m$/m, function(line, match) {
  let room = match[1];
  // This is an overly greedy regex and can match things that aren't room
  // names, so do a quick sanity check
  if(room.indexOf("speaks from the") !== -1) {
    return;
  }

  // Now setup a one-time trigger to look for the exit line
  session.trigger(/^\x1B\[0;36m\[ (?:obvious exits|Exits): ([^\]]*)\]\x1B\[0m$/m, function(_, m2) {
    let exits = m2[1].trim().split(" ");
    console.log("Found room:", room, "with exits:", exits);
    session.emit("room", { name: room, exits: exits });
  }, { once: true });
});

let path = session.path("n s e w");

session.alias("step", function() {
  path.step();
});

let nodir = [
  /Alas, you cannot go that way...$/m,
  /You can't ride in there.$/m,
  /Your mount is too exhausted.$/m,
  /In your dreams, or what?/m,
  /Maybe you should get on your feet first?/m,
  /No way! {2}You're fighting for your life!/m,
  /You would need to swim there, you can't just walk it.$/m,
  /You are too exhausted.$/m,
  /You would need a boat to go there.$/m,
  /The (\w+) seems to be closed.$/m
];

for(let i = 0; i < nodir.length; i++) {
  session.trigger(nodir[i], path.unstep.bind(path));
}

module.exports = session;
