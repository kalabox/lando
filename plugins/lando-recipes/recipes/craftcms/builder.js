'use strict';

// Modules
const _ = require('lodash');

/*
 * Helper to get cache
 */
const getCache = cache => {
  // Return redis
  if (_.includes(cache, 'redis')) {
    return {
      type: cache,
      portforward: true,
      persist: true,
    };
    // Or memcached
  } else if (_.includes(cache, 'memcached')) {
    return {
      type: cache,
      portforward: true,
    };
  }
};

/*
 * Build Laravel
 */
module.exports = {
  name: 'craft',
  parent: '_lamp',
  config: {
    confSrc: __dirname,
    config: {},
    composer: {},
    database: 'mysql',
    defaultFiles: {
      php: 'php.ini',
    },
    php: '7.3',
    services: {},
    tooling: {},
    via: 'apache',
    webroot: 'web',
    xdebug: false,
  },
  builder: (parent, config) => class LandoCraft extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      if (_.has(options, 'cache') && options.cache !== 'none') {
        options.services.cache = getCache(options.cache);
      }
      options.tooling.craft = {
        service: 'appserver',
        cmd: `php /app/${options.webroot}/../craft`,
      };
      // Send downstream
      super(id, options);
    };
  },
};
