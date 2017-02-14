/**
 * Anonymous metrics reporting for Lando.
 *
 * @name metrics
 */

'use strict';

var _ = require('./node')._;
var Client = require('kalabox-stats-client').Client;
var config = require('./config');
var error = require('./error');
var fs = require('fs');
var log = require('./logger');
var path = require('path');
var Promise = require('./promise');
var uuid = require('uuid');

/*
 * Instance ID filename.
 */
var INSTANCE_ID_FILENAME = '.instance.id';

/*
 * Get a REST client instance.
 */
var getClient = function(id) {

  // Get URL of metrics REST API from metrics config.
  var url = config.stats.url;

  // Return new client.
  return new Client({
    id: id,
    url: url
  });

};

/*
 * Get the metrics ID for this kalabox instance.
 */
var getId = function() {

  // Build filepath to ID file.
  var idFilepath = path.join(config.userConfRoot, INSTANCE_ID_FILENAME);

  // Read ID file.
  return Promise.fromNode(function(cb) {
    fs.readFile(idFilepath, {encoding: 'utf8'}, cb);
  })

  // File does not exist.
  .catch(function(err) {
    if (err.code === 'ENOENT') {
      // IF file doesn't exist just return null.
      return null;
    }
    throw err;
  })

  // If ID file doesn't exist, get new ID from REST API and write ID file.
  .then(function(id) {
    if (id) {
      return id;
    }
    else {
      id = uuid.v4();
      // Write new ID to ID file.
      return Promise.fromNode(function(cb) {
        fs.writeFile(idFilepath, id, cb);
      })
      // Return id.
      .return(id);
    }
  });

};

/*
 * Report meta data for metrics.
 */
var reportInternal = function(data) {

  // Get ID.
  return getId()

  // Get client.
  .then(function(id) {
    return getClient(id);
  })

  // Report meta data.
  .then(function(client) {
    return client.report(data);
  });

};

/**
 * Report meta data for metrics.
 * @memberof metrics
 */
var report = function(data) {

  // IF reporting is on
  if (config.stats.report) {

    // List of functions for adding meta data to report.
    var fns = [

      // Add mode (gui|cli) information.
      function() {
        data.mode = config.mode;
      },

      // Add information from config.
      function() {
        // Backwards compat.
        data.devMode = false;
        // Add kalabox version information.
        data.version = config.version;
        // Add operation system information.
        data.os = config.os;
      },

      // Add node version information.
      function() {
        data.nodeVersion = process.version;
      }

    ];

    // Add to meta data.
    return Promise.each(fns, function(fn) {
      // Run meta data add function in context of a promise.
      return Promise.try(fn)
      // Ignore errors.
      .catch(function() {});
    })

    // Report to remote service.
    .then(function() {
      return reportInternal(data);
    })

    // Log metrics to debug log for transparency.
    .tap(function() {
      log.debug('Reporting.', data);
    })

    // Make sure an unresponsive service doesn't hang the application.
    .timeout(10 * 1000)

    // Wrap errors.
    .catch(function(err) {
      log.warn('METRICS ERROR: ' + err.message);
    });

  }
  else {

    // Reporting is turned off.
    return Promise.resolve();

  }

};

/**
 * Short cut for reporting actions.
 * @memberof metrics
 */
exports.reportAction = function(action, opts) {

  // Metadata to report.
  var obj = {
    action: action
  };

  // Try to gather extra metadata from a possible app object.
  var config = _.get(opts, 'app.config');
  if (config) {
    var type = _.get(config, 'type');
    var email = _.get(config, 'pluginconfig[' + type + '].email');
    obj.email = email;
  }

  // Report.
  return report(obj);

};

/**
 * Document
 * @memberof metrics
 */
exports.reportError = function(err) {

  var data = {
    action: 'error',
    message: err.message,
    stack: error.getStackTrace(err),
    tags: error.errorTags.get(err)
  };

  return report(data);

};
