/**
 * This is a nifty cross platform script that will replace relevant versions
 * in json files with a "dev" version generated with `git describe`
 */

'use strict';

// Grab needed modules
var _ = require('lodash');
var bump = require('./../tasks/util.js')();
var fs = require('fs-extra');
var path = require('path');
var Promise = require('./../lib/promise.js');
var shell = require('shelljs');

// Get the location of the files we need to edit
var files = bump.bump.options.files;

// Start our sacred promise
return new Promise(function(resolve, reject) {
  shell.exec(['git describe'], {silent: true}, function(code, stdout, stderr) {
    if (code !== 0) {
      reject(new VError('code: ' + code + 'err:' + stderr));
    }
    else {
      resolve(stdout);
    }
  });
})

// Get the git describe result and parse it
.then(function(data) {
  return _.trim(data.slice(1));
})

// Replace the version for our files
.then(function(newVersion) {
  _.forEach(files, function(file) {
    var location = path.join(process.cwd(), file);
    var data = require(location);
    data.version = newVersion;
    fs.writeFileSync(location, JSON.stringify(data, null, 2));
  });
})
