/**
 * Contains utility functions.
 *
 * @since 3.0.0
 * @module utils
 * @example
 *
 * // Take an object and write a docker compose file
 * var filename = lando.utils.compose(filename, data);
 *
 * // Scan URLs and print results
 * return lando.utils.scanUrls(urls)
 * .then(function(results) {
 *   console.log(results);
 * });
 */

'use strict';

// Modules
var _ = require('./node')._;
var fs = require('./node').fs;
var log = require('./logger');
var path = require('path');
var Promise = require('./promise');
var rest = require('./node').rest;
var yaml = require('./node').yaml;

/**
 * Writes a docker compose object to a file.
 *
 * @since 3.0.0
 * @param {String} file - The absolute path to the destination file.
 * @param {Object} data - The data to write to the file.
 * @returns {String} The absolute path to the destination file.
 * @example
 *
 * // Take an object and write a docker compose file
 * var filename = lando.utils.compose(filename, data);
 */
exports.compose = function(file, data) {

  // Make sure we have a place to store these files
  fs.mkdirpSync(path.dirname(file));

  // Drop our containers into a file
  fs.writeFileSync(file, yaml.safeDump(data));

  // Log
  var services = _.keys(data);
  log.verbose('Building compose file at %s with services.', file, services);
  log.verbose('Writing %j to %s', services, file);
  log.debug('Full services for %s', file, data);

  // Return the filename
  return file;

};

/**
 * Scans URLs to determine if they are up or down.
 *
 * @since 3.0.0
 * @param {Array} urls - An array of urls like `https://mysite.lndo.site` or `https://localhost:34223`
 * @param {Object} [opts] - Options to configure the scan.
 * @param {Integer} [opts.max=7] - The amount of times to retry accessing each URL.
 * @param {Array} [opts.waitCode=[400, 502] - The HTTP codes to prompt a retry.
 * @returns {Array} An array of objects of the form {url: url, status: true|false}
 * @example
 *
 * // Scan URLs and print results
 * return lando.utils.scanUrls(['http://localhost', 'https://localhost'])
 * .then(function(results) {
 *   console.log(results);
 * });
 */
exports.scanUrls = function(urls, opts) {

  // Scan opts
  opts = {
    max: opts.max || 7,
    waitCodes: opts.waitCodes || [400, 502]
  };

  // Log
  log.debug('Starting url scan with opts', opts);

  // Ping the sites for awhile to determine if they are g2g
  return Promise.map(urls, function(url) {

    // Do a reasonable amount of retries
    return Promise.retry(function() {

      // Log the attempt
      log.verbose('Checking to see if %s is ready.', url);

      // Send REST request.
      return new Promise(function(fulfill, reject) {

        // Make the actual request, lets make sure self-signed certs are OK
        rest.get(url, {rejectUnauthorized: false})

        // The URL is accesible
        .on('success', function() {
          log.verbose('%s is now ready.', url);
          fulfill({url: url, status: true});
        })

        // Throw an error on fail/error
        .on('fail', function(data, response) {

          // Get the code
          var code = response.statusCode;

          // If we have a wait code try again
          if (_.includes(opts.waitCodes, code)) {
            log.debug('%s not yet ready with code %s.', url, code);
            reject({url: url, status: false});
          }

          // If we have another code then we assume thing are ok
          else {
            log.debug('%s is now ready.', url);
            fulfill({url: url, status: true});
          }

        })

        // Something else bad happened
        .on('error', reject);

      });

    }, {max: opts.max})

    // Catch any error and return an inaccesible url
    .catch(function(err) {
      log.verbose('%s is not accessible', url);
      log.debug('%s not accessible with error', url, err.message);
      return {url: url, status: false};
    });

  })

  // Log and then return scan results
  .then(function(results) {
    log.debug('URL scan results', results);
    return results;
  });

};
