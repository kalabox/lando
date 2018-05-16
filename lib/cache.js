'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs-extra');
const jsonfile = require('jsonfile');
const Log = require('./logger');
const NodeCache = require('node-cache');
const os = require('os');
const path = require('path');

/*
 * Creates a new Cache instance.
 *
 * @param {object} opts
 * @return
 */
class Cache extends NodeCache {
  constructor({log, cacheDir} = {}) {
    // Get the nodecache opts
    super();

    // Set some things
    this.log = log || new Log();
    this.cacheDir = cacheDir || path.join(os.tmpdir(), '.cache');

    // Ensure the cache dir exists
    fs.mkdirpSync(this.cacheDir);
  }

  /**
   * Sets an item in the cache
   *
   * @since 3.0.0
   * @alias 'lando.cache.set'
   * @param {String} key - The name of the key to store the data with.
   * @param {Any} data - The data to store in the cache.
   * @param {Object} [opts] - Options to pass into the cache
   * @param {Boolean} [opts.persist=false] - Whether this cache data should persist between processes. Eg in a file instead of memory
   * @param {Integer} [opts.ttl=0] - Seconds the cache should live. 0 mean forever.
   * @example
   *
   * // Add a string to the cache
   * lando.cache.set('mykey', 'mystring');
   *
   * // Add an object to persist in the file cache
   * lando.cache.set('mykey', data, {persist: true});
   *
   * // Add an object to the cache for five seconds
   * lando.cache.set('mykey', data, {ttl: 5});
   */
  set(key, data, opts) {
    // Unsafe cache key patterns
    const patterns = {
      controlRe: /[\x00-\x1f\x80-\x9f]/g,
      illegalRe: /[\/\?<>\\:\*\|":]/g,
      reservedRe: /^\.+$/,
      windowsReservedRe: /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i,
      windowsTrailingRe: /[\. ]+$/
    };
    _.map(patterns, pattern => {
      if (key.match(pattern)) throw new Error('Invalid cache key');
    });

    // Defaults opts
    const defaults = {
      persist: false,
      ttl: 0
    };

    // Merge opts over over our defaults
    opts = _.merge(defaults, opts);

    // Try to set cache
    if (this.__set(key, data, opts.ttl)) {
      this.log.debug('Cached %j with key %s for %j', data, key, opts);
    }

    // Report failed cache set
    else {
      this.log.debug('Failed to cache %j with key %s', data, key);
    }

    // And add to file if we have persistence
    if (opts.persist) {
      jsonfile.writeFileSync(path.join(this.cacheDir, key), data);
    }

  }

  /**
   * Gets an item in the cache
   *
   * @since 3.0.0
   * @alias 'lando.cache.get'
   * @param {String} key - The name of the key to retrieve the data.
   * @return {Any} The data stored in the cache if applicable.
   * @example
   *
   * // Get the data stored with key mykey
   * var data = lando.cache.get('mykey');
   */
  get(key) {

    // Get from cache
    const memResult = this.__get(key);

    // Return result if its in memcache
    if (memResult) {
      this.log.debug('Retrieved from memcache with key %s', key);
      return memResult;
    }

    // Then try file cache
    else {
      try {
        this.log.debug('Trying to retrieve from file cache with key %s', key);
        return jsonfile.readFileSync(path.join(this.cacheDir, key));
      }
      catch (e) {
        this.log.debug('File cache miss with key %s', key);
      }
    }

  }

  /**
   * Manually remove an item from the cache.
   *
   * @since 3.0.0
   * @alias 'lando.cache.remove'
   * @param {String} key - The name of the key to remove the data.
   * @example
   *
   * // Remove the data stored with key mykey
   * lando.cache.remove('mykey');
   */
  remove(key) {

    // Try to get cache
    if (this.__del(key) === 1) {
      this.log.debug('Removed key %s from memcache.', key);
    }

    // Also remove file if applicable
    try {
      fs.unlinkSync(path.join(this.cacheDir, key));
    }
    catch (e) {
      this.log.debug('No file cache with key %s', key);
    }

  }
}

/*
 * Stores the old get method.
 */
Cache.prototype.__get = NodeCache.prototype.get;

/*
 * Stores the old set method.
 */
Cache.prototype.__set = NodeCache.prototype.set;

/*
 * Stores the old del method.
 */
Cache.prototype.__del = NodeCache.prototype.del;

/*
 * Return the class
 */
module.exports = Cache;
