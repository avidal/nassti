/* jshint node:true, esnext:true */
'use strict';

const colors = require('colors/safe');

function dec2hex(n) {
  return "0x" + (n+0x1000).toString(16).substr(-2).toUpperCase();
}

function pretty(bytes) {
  // Consume each byte, converting nonprintable into \xXY and runs of printable
  // into [<len>]
  let output = [];
  let byt = null;
  let strlen = 0;

  let telopts = {
    255: "IAC",
    254: "DONT",
    253: "DO",
    252: "WONT",
    251: "WILL",
    250: "SB",
    249: "GA",
    248: "EL",
    247: "EC",
    246: "AYT",
    245: "ABORT",
    244: "INTERRUPT",
    243: "BREAK",
    242: "DM",
    241: "NOOP",
    240: "SE"
  };

  for(let i = 0; i < bytes.length; i++) {
    byt = bytes[i];
    if(byt >= 0x20 && byt <= 0x7E) {
      strlen += 1;
      continue;
    }

    // It's unprintable!
    if(strlen) {
      output.push(`[-${strlen}-]`);
      strlen = 0;
    }

    // If it's one of the regular telopt things, use that
    if(telopts[byt]) {
      output.push(colors.green(telopts[byt]));
      continue;
    }

    if(byt === 0x0D) {
      output.push(colors.grey("CR"));
      continue;
    }

    if(byt === 0x0A) {
      output.push(colors.grey("LF"));
      continue;
    }

    if(byt === 0x00) {
      output.push(colors.dim("NUL"));
      continue;
    }

    if(byt === 0x1b) {
      output.push(colors.blue("ESC"));
      continue;
    }

    // Otherwise, convert to hex and print it in yellow
    output.push(colors.yellow(dec2hex(byt)));

  }

  if(strlen) {
    output.push(`[-${strlen}-]`);
  }

  return output.join(" ");
}

exports.dec2hex = dec2hex;
exports.pretty = pretty;
