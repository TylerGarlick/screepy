"use strict";

const screeps = require('rollup-plugin-screeps');

let cfg;
const dest = process.env.DEST;
if (!dest) {
  console.log("No destination specified - code will be compiled but not uploaded");
} else if ((cfg = require("./screeps.json")[dest]) == null) {
  throw new Error("Invalid upload destination");
}

module.exports = {
  input: "dist/main.js",  // Bun transpiles TypeScript to JS
  output: {
    file: "dist/main.screeps.js",  // Final bundled file for Screeps
    format: "cjs",
    sourcemap: true
  },

  plugins: [
    // No TypeScript plugin needed - Bun handles transpilation
    // No clear plugin - Bun already outputs fresh files
    screeps({config: cfg, dryRun: cfg == null})
  ]
}
