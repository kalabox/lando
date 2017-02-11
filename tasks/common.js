'use strict';

/**
 * @file
 * This file/module contains common things needed by many tasks.
 */

// System info
var system = {
  platform: (process.platform !== 'darwin') ? process.platform : 'osx'
};

// All js files
var jsFiles = [
  'Gruntfile.js',
  'bin/**/*.js',
  'cmds/**/*.js',
  'lib/**/*.js',
  'modules/**/*.js',
  'plugins/**/*.js',
  'tasks/**/*.js',
  'tests/**/*.js'
];

// Return our objects
module.exports = {
  system: system,
  files: {
    js: jsFiles
  }
};
