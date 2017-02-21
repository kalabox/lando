/**
 * Promises module
 *
 * @name promise
 */

'use strict';

// Modules
var log = require('./logger');
var Promise = require('bluebird');

// Use long stack traces.
Promise.longStackTraces();

// Handle unhandeld rejections
process.on('unhandledRejection', function(err) {
  log.error(err);
});

/*
 * Retry the function fn up to opts.max times until it successfully completes
 * without an error. Pause opts.backoff * retry miliseconds between tries.
 */
function retry(promise, fn, opts) {

  // Piggy back off of previous promise.
  return promise.then(function() {

    // Setup default options.
    opts = opts || {};
    opts.max = opts.max || 5;
    opts.backoff = opts.backoff || 500;

    // Recursive function.
    var rec = function(counter) {

      // Call function fn within the context of a Promise.
      return Promise.try(function() {
        return fn(counter);
      })
      // Handle errors.
      .catch(function(err) {

        // If we haven't reached max retries, delay for a short while and
        // then retry.
        if (counter < opts.max) {

          return Promise.delay(opts.backoff * counter)
          .then(function() {
            return rec(counter + 1);
          });

        } else {

          // No retries left so wrap and throw the error.
          throw new Error(
            err,
            'Failed after %s retries. %s',
            opts.max,
            JSON.stringify(opts)
          );

        }
      });

    };

    // Init recursive function.
    return rec(1);

  });

}

/**
 * Static version of retry.
 * @param  {Function} fn   [description]
 * @param  {[type]}   opts [description]
 * @return {[type]}        [description]
 */
Promise.retry = function(fn, opts) {
  return retry(Promise.resolve(), fn, opts);
};

/**
 * Instance version of retry.
 * @param  {Function} fn   [description]
 * @param  {[type]}   opts [description]
 * @return {[type]}        [description]
 */
Promise.prototype.retry = function(fn, opts) {
  return retry(this, fn, opts);
};

/**
 * [exports description]
 * @type {[type]}
 */
module.exports = Promise;
