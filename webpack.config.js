/**
    This configuration is set up to handle a project where the source files are 
    written in TypeScript, and the bundled output is placed in a directory that 
    can be served by a web server.
 */

const path = require("path");

// How Webpack should process and bundle the files.
module.exports = {
  // Specifies the entry point of the application. Webpack will start
  // bundling from this file. Here, it's set to ./src/index.ts, meaning
  // Webpack will start from this TypeScript file
  entry: "./src/index.ts",
  // Defining module rules: Contains rules on how to handle different types of files
  module: {
    // An array of rules for transforming files.
    rules: [
      {
        // A regular expression that matches files with a .ts or .tsx extension
        test: /\.tsx?$/,
        // Specifies the loader to use for these files. Here, ts-loader is used, which
        // transpiles TypeScript files to JavaScript
        use: "ts-loader",
        // Excludes the node_modules directory from being processed by the loader, which
        // improves build performance
        exclude: /node_modules/,
      },
    ],
  },
  // Resolving file extensions: Specifies how modules should be resolved
  resolve: {
    // An array of file extensions that Webpack will resolve. This means you can import
    // files without specifying their extensions, and Webpack will try these extensions
    // in order
    extensions: [".tsx", ".ts", ".js"],
  },
  // Specifies where the bundled files will be output
  output: {
    // The name of the output file. Here, it's set to index.js
    filename: "index.js",
    // resolves to the public/dist directory relative to the current directory
    path: path.resolve(__dirname, "public/dist"),
  },
  // Specifies the mode for Webpack. Setting it to "development" enables useful
  // development features like better debugging and faster build times
  mode: "development",
};
