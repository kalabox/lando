/**
 * Contains methods and events related to app actions.
 *
 * @since 3.0.0
 * @module app
 * @example
 *
 * // Start an app
 * return lando.app.start(app);
 *
 * // Stop an app
 * return lando.app.stop(app);
 *
 * // Destroy an app
 * return lando.app.destroy(app);
 *
 * // Get the app called myapp
 * return lando.app.get('myapp')
 * .then(function(app) {
 *   console.log(app);
 * });
 *
 * // Get a list of all the apps
 * return lando.app.list()
 * .then(function(apps) {
 *   console.log(apps);
 * });
 */

'use strict';

// Modules
var _ = require('./node')._;
var AsyncEvents = require('./events');
var fs = require('./node').fs;
var config = require('./config');
var daemon = require('./daemon');
var lando = require('./lando')(config);
var path = require('path');
var Promise = require('./promise');
var registry = require('./registry');
var util = require('util');
var yaml = require('./node').yaml;

// Get some scope on our things
var _app = this;

/**
 * Instantiate
 * @fires pre-app-instantiate
 * @fires post-instantiate-app
 * @fires app-ready
 * @private
 */
var instantiate = function(name, dir, config) {

  // Log some things
  lando.log.verbose('Getting app %s from %s', name, dir);
  lando.log.debug('App %s uses config', name, config);

  /**
   * Event that allows altering of the config before it is used to
   * instantiate an app object.
   *
   * Note that this is a global event so it is invoked with `lando.events.on`
   * not `app.events.on` See example below:
   *
   * @since 3.0.0
   * @event module:app.event:pre-instantiate-app
   * @property {Object} config The config from the app's .lando.yml
   * @example
   * // Add in some extra default config to our app, set it to run first
   * lando.events.on('pre-instantiate-app', 1, function(config) {
   *
   *   // Add a process env object, this is to inject ENV into the process
   *   // running the app task so we cna use $ENVARS in our docker compose
   *   // files
   *   config.dialedToInfinity = true;
   *
   * });
   */
  return lando.events.emit('pre-instantiate-app', config)

  // Create app.
  .then(function() {

    // Init.
    var app = {};
    // Self replication
    app._app = _app;
    // Name.
    app.name = config.name || name;
    // Name translated to what docker wants.
    app.dockerName = app.name.replace(/-/g, '');
    // Config
    app.config = config || {};
    // Asynchronous event emitter.
    app.events = new AsyncEvents();
    // Adds an object to collect helpful info about the app
    app.info = {};
    // Root.
    app.root = dir;
    // Root bind.
    app.rootBind = daemon.path2Bind4U(app.root);
    // App mount
    app.mount = '/app';
    // App specific tasks
    app.tasks = lando.tasks.tasks || {};
    // Webroot
    app.webRoot = config.webroot || '.';
    // Update app status which will fire a status event.
    app.status = function() {
      var args = _.toArray(arguments);
      var msg = util.format.apply(null, args);
      return app.events.emit('status', msg)
      // Make sure app status messages make it to global status.
      .then(function() {
        return lando.log.info(msg);
      });
    };
    // Troll through stdout messages for app status messages.
    app.trollForStatus = function(msg) {
      // Update status when pulling an image.
      var images = msg.match(/Pulling from (.*)/);
      if (images) {
        app.status('Pulling image %s.', images[1]);
      }
    };

    // Return our app
    return app;

  })

  /**
   * Event that allows altering of the app object right after it is
   * instantiated.
   *
   * Note that this is a global event so it is invoked with `lando.events.on`
   * not `app.events.on` See example below:
   *
   * @since 3.0.0
   * @event module:app.event:post-instantiate-app
   * @property {object} config The user's app config.
   * @example
   * // Add some extra app properties to all apps
   * lando.events.on('post-instantiate-app', 1, function(app) {
   *
   *   // Add in some global container envvars
   *   app.env.LANDO = 'ON';
   *   app.env.LANDO_HOST_OS = lando.config.os.platform;
   *   app.env.LANDO_HOST_UID = lando.config.engineId;
   *   app.env.LANDO_HOST_GID = lando.config.engineGid;
   *
   * });
   */
  .tap(function(app) {
    return lando.events.emit('post-instantiate-app', app);
  })

  // Register app.
  .tap(function(app) {
    return registry.register({name: app.name, dir: app.root});
  })

  // Load plugins.
  .tap(function(app) {
    _.forEach(app.config.plugins, function(plugin) {
      return lando.plugins.load(plugin, app.root);
    });
  })

  // Emit app ready event.
  .tap(function(app) {

    /**
     * Event that allows altering of the app object right after it has been
     * full instantiated and all its plugins have been loaded.
     *
     * The difference between this event and `post-instantiate-app` is that at
     * this point the event has been handed off from the global `lando.events.on`
     * context to the `app.events.on` context. This means that `post-instantiate-app` will
     * run for ALL apps that need to be instantiated while `app-ready` will run
     * on an app to app basis.
     *
     * @since 3.0.0
     * @event module:app.event:app-ready
     * @example
     * // Add logging to report on our apps properties after its full dialed
     * app.events.on('app-ready', function() {
     *
     *   // Log
     *   lando.log.verbose('App %s has global env.', app.name, app.env);
     *   lando.log.verbose('App %s has global labels.', app.name, app.labels);
     *   lando.log.verbose('App %s adds process env.', app.name, app.processEnv);
     *
     * });
     */
    return app.events.emit('app-ready')

    // Log some results
    .then(function() {
      lando.log.info('App %s is ready!', app.name);
      lando.log.debug('App %s has config', app.name, app.config);
    });
  });

};

/**
 * Lists all the Lando apps from the app registry.
 *
 * @since 3.0.0
 * @param {Object} [opts] - Options to determine how list is run
 * @param {Boolean} [opts.useCache=true] - Use the app cache
 * @returns {Promise} Returns a Promise with an array of apps from the registry
 * @example
 *
 * // List all the apps
 * return lando.app.list()
 *
 * // Pretty print each app to the console.
 * .map(function(app) {
 *   console.log(JSON.stringify(app, null, 2));
 * });
 */
exports.list = function(opts) {

  // Set opt defaults
  opts = opts || {useCache: true};

  // Log
  lando.log.verbose('Trying to get list of apps with opts', opts);

  // Get list of app names.
  return registry.getApps(opts)

  // Validate list of apps, look for duplicates.
  .then(function(apps) {

    // Group apps by app names.
    var groups = _.groupBy(apps, function(app) {
      return app.name;
    });

    // Find a set of duplicates.
    var duplicates = _.find(groups, function(group) {
      return group.length !== 1;
    });

    // If a set of duplicates were found throw an error.
    if (duplicates) {
      throw new Error('Duplicate app names exist', duplicates);
    }

    // Pass the apps on to the each
    return apps;

  });

};

/**
 * Gets a fully instantiated app object.
 *
 * If you do not pass in an `appName` Lando will attempt to find an app in your
 * current working directory.
 *
 * Lando will also scan parent directories if no app is found.
 *
 * @since 3.0.0
 * @param {String} [appName] - The name of the app to get.
 * @returns {Promise} Returns a Pronise with an instantiated app object or nothing.
 * @example
 *
 * // Get an app named myapp and start it
 * return lando.app.get('myapp')
 *
 * // Start the app
 * .then(function(app) {
 *   lando.app.start(app);
 * });
 */
exports.get = function(appName) {

  // If we have an appName lets try to match it with a diretory
  return Promise.try(function() {
    if (appName) {
      return exports.list()
      .then(function(apps) {
        return _.find(apps, function(app) {
          return app.name === appName || app.dockerName === appName;
        });
      });
    }
  })

  // Try to use a found app first if possible then default to the cwd
  .then(function(app) {
    return _.get(app, 'dir') || path.join(process.cwd());
  })

  // Return an app or warn the user there is no such app
  .then(function(dir) {

    // Split up our dir
    var pieces = dir.split(path.sep);

    // Go through all dir pieces
    return _.map(pieces, function() {

      // Build the dir
      var dir = pieces.join(path.sep);

      // Drop the last path for next iteration
      pieces = _.dropRight(pieces);

      // Return the possible location of lando files
      return path.join(dir, lando.config.appConfigFilename);

    });

  })

  // Return the first directory that has an app
  .then(function(files) {

    // Find the first directory that has a lando.yml
    var configFile = _.find(files, function(file) {
      lando.log.verbose('Checking for app config at %s', file);
      return fs.existsSync(file);
    });

    // If we have a config file let's load up the app
    if (!_.isEmpty(configFile)) {
      var appConfig = yaml.safeLoad(fs.readFileSync(configFile));
      return instantiate(appConfig.name, path.dirname(configFile), appConfig);
    }

  });

};

/**
 * Determines whether an app is running or not.
 *
 * You can pass in an entire app object here but it really just needs an object
 * with the app name eg {name: 'myapp'}
 *
 * @since 3.0.0
 * @param {Object} app - An app object.
 * @param {String} app.name - The name of the app
 * @returns {Promise} Returns a Promise with a boolean of whether the app is running or not.
 * @example
 *
 * // Let's check to see if the app has been started
 * return lando.app.isRunning(app)
 *
 * // Start the app if its not running already
 * .then(function(isRunning) {
 *   if (!isRunning) {
 *     return lando.app.start(app);
 *   }
 * });
 */
exports.isRunning = function(app) {

  // Log
  lando.log.verbose('Checking if %s is running', app.name);

  // Check if our engine is up
  return lando.engine.isUp()

  // If we are up check for containers running for an app
  // otherwise return false
  .then(function(isUp) {

    // Engine is up so lets check if the app has running containers
    if (isUp) {

      // Get list of containers
      return lando.engine.list(app.name)

      // Filter out autostart containers since those will always report TRUE
      .filter(function(container) {
        return lando.engine.inspect(container)
        .then(function(data) {
          return data.HostConfig.RestartPolicy.Name !== 'always';
        });
      })

      // Reduce containers to a true false running value
      .reduce(function(isRunning, container) {
        return (isRunning) ? true : lando.engine.isRunning(container.id);
      }, false);

    }

    // Engine is down so nothing can be running
    else {
      return false;
    }

  });

};

/**
 * Checks to see if the app exists or not.
 *
 * @since 3.0.0
 * @param {String} appName - The name of the app to get.
 * @returns {Promise} A promise with a boolean of whether the app exists or not.
 * @example
 *
 * // Get an app named myapp and start it
 * return lando.app.exists('myapp')
 *
 * // Theorize if app exists
 * .then(function(exists) {
 *   if (exists) {
 *     console.log('I think, therefore I am.')
 *   }
 * });
 */
exports.exists = function(appName) {

  // Get app.
  return _app.get(appName)

  // Return false if we get an app does not exist error.
  .catch(function(err) {
    if (_.contains(err.message, ' does not exist.')) {
      return false;
    }
    else {
      throw err;
    }
  })

  // Return true if app was returned.
  .then(function(app) {
    return !!app;
  });

};

/**
 * Prints useful information about the app's services.
 *
 * This should return information about the services the app is running,
 * URLs the app can be accessed at, relevant connection information like database
 * credentials and any other information that is added by other plugins.
 *
 * @since 3.0.0
 * @fires pre-info
 * @param {Object} app - A fully instantiated app object
 * @returns {Promise} A Promise with an object of information about the app keyed by its services
 * @example
 *
 * // Return the app info
 * return lando.app.info(app)
 *
 * // And print out any services with urls
 * .each(function(service) {
 *   if (_.has(service, 'urls')) {
 *     console.log(service.urls);
 *   }
 * });
 */
exports.info = function(app) {

  /**
   * Event that allows other things to add useful metadata to the apps services.
   *
   * Its helpful to use this event to add in information for the end user such as
   * how to access their services, where their code exsts or relevant credential info.
   *
   * @since 3.0.0
   * @event module:app.event:pre-info
   * @example
   *
   * // Add urls to the app
   * app.events.on('pre-info', function() {
   *   return getUrls(app);
   * });
   */
  return app.events.emit('pre-info')

  // Return all the app info
  .then(function() {
    if (app && app.info) {
      return app.info;
    }
  });

};

/**
 * Soft removes the apps services but maintains persistent data like app volumes.
 *
 * This differs from `destroy` in that destroy will hard remove all app services,
 * volumes, networks, etc as well as remove the app from the appRegistry.
 *
 * @since 3.0.0
 * @fires pre-uninstall
 * @fires post-uninstall
 * @param {Object} app - A fully instantiated app object
 * @returns {Promise} A Promise.
 * @example
 *
 * // Uninstall the app
 * return lando.app.uninstall(app)
 *
 * // Catch any errors
 * catch(function(err) {
 *   lando.log.error(err);
 * });
 *
 */
exports.uninstall = function(app) {

  // Cleaning up
  app.status('Uninstalling %s', app.name);

  // Report to metrics.
  return lando.metrics.reportAction('uninstall', {app: app})

  /**
   * Event that runs before an app is uninstalled.
   *
   * This is useful if you want to add or remove parts of the uninstall process.
   * For example, it might be nice to persist a container whose data you do not
   * want to replace in a rebuild and that cannot persist easily with a volume.
   *
   * @since 3.0.0
   * @event module:app.event:pre-uninstall
   * @example
   *
   * // Do not uninstall the solr service
   * app.events.on('pre-uninstall', function() {
   *   delete app.services.solr;
   * });
   */
  .then(function() {
    return app.events.emit('pre-uninstall');
  })

  // Kill components.
  .then(function() {
    return lando.engine.destroy(app);
  })

  /**
   * Event that runs after an app is uninstalled.
   *
   * This is useful if you want to do some additional cleanup steps after an
   * app is uninstalled such as invalidating any cached data.
   *
   * @since 3.0.0
   * @event module:app.event:post-uninstall
   * @example
   *
   * // Make sure we remove our build cache
   * app.events.on('post-uninstall', function() {
   *   lando.cache.remove(app.name + ':last_build');
   * });
   */
  .then(function() {
    return app.events.emit('post-uninstall');
  });

};

/**
 * Does some helpful cleanup before running an app operation.
 *
 * This command helps clean up apps in an inconsistent state and any orphaned
 * containers they may have.
 *
 * @todo Should this be an internal method? Or can we deprecate at some point?
 * @since 3.0.0
 * @param {Object} app - A fully instantiated app object
 * @returns {Promise} A Promise.
 * @example
 *
 * // Do the app cleanup
 * return lando.app.cleanup(app)
 *
 */
exports.cleanup = function(app) {

  // Cleaning up
  app.status('Cleaning up app registry and containers');

  // Get all our containers
  return _app.list({useCache: false})

  // We need to use the dockername
  .map(function(app) {
    return app.name.replace(/-/g, '');
  })

  // Filter out non-app containers
  .then(function(apps) {
    return Promise.filter(lando.engine.list(), function(container) {
      return container.kind === 'app' && !_.includes(apps, container.app);
    });
  })

  // Stop containers if needed
  .tap(function(containers) {
    return lando.engine.stop(containers);
  })

  // Kill containers if needed
  .tap(function(containers) {
    return lando.engine.destroy(containers);
  });

};

/**
 * Starts an app.
 *
 * This will start up all services/containers that have been defined for this app.
 *
 * @since 3.0.0
 * @fires pre-start
 * @fires post-start
 * @param {Object} app - A fully instantiated app object
 * @returns {Promise} A Promise.
 * @example
 *
 * // Start the app
 * return lando.app.start(app)
 *
 * // Catch any errors
 * catch(function(err) {
 *   lando.log.error(err);
 * });
 *
 */
exports.start = function(app) {

  // Start it up
  app.status('Starting %s', app.name);

  // Report to metrics.
  return lando.metrics.reportAction('start', {app: app})

  // Make sure we are in a clean place before we get dirty
  .then(function() {
    return _app.cleanup(app);
  })

  /**
   * Event that runs before an app starts up.
   *
   * This is useful if you want to start up any support services before an app
   * stars.
   *
   * @since 3.0.0
   * @event module:app.event:pre-start
   * @example
   *
   * // Start up a DNS server before our app starts
   * app.events.on('pre-start', function() {
   *   return lando.engine.start(dnsServer);
   * });
   */
  .then(function() {
    return app.events.emit('pre-start');
  })

  // Start core containers
  .then(function() {
    return lando.engine.start(app);
  })

  /**
   * Event that runs after an app is started.
   *
   * This is useful if you want to perform additional operations after an app
   * starts such as running additional build commands.
   *
   * @since 3.0.0
   * @event module:app.event:post-start
   * @example
   *
   * // Go through each service and run additional build commands as needed
   * app.events.on('post-start', function() {
   *
   *   // Start up a build collector
   *   var build = [];
   *
   *   // Go through each service
   *   _.forEach(app.config.services, function(service, name) {
   *
   *     // If the service has extras let's loop through and run some commands
   *     if (!_.isEmpty(service.extras)) {
   *
   *       // Normalize data for loopage
   *       if (!_.isArray(service.extras)) {
   *         service.extras = [service.extras];
   *       }
   *
   *       // Run each command
   *       _.forEach(service.extras, function(cmd) {
   *
   *         // Build out the compose object
   *         var compose = {
   *           id: [app.dockerName, name, '1'].join('_'),
   *             cmd: cmd,
   *             opts: {
   *             mode: 'attach'
   *           }
   *         };
   *
   *         // Push to the build
   *         build.push(compose);
   *
   *       });
   *
   *     }
   *
   *   });
   *
   *   // Only proceed if build is non-empty
   *   if (!_.isEmpty(build)) {
   *
   *    // Get the last build cache key
   *    var key = app.name + ':last_build';
   *
   *    // Compute the build hash
   *    var newHash = lando.node.hasher(app.config.services);
   *
   *    // If our new hash is different then lets build
   *    if (lando.cache.get(key) !== newHash) {
   *
   *      // Set the new hash
   *      lando.cache.set(key, newHash, {persist:true});
   *
   *      // Run all our post build steps serially
   *      return lando.engine.run(build);
   *
   *    }
   *   }
   * });
   */
  .then(function() {
    return app.events.emit('post-start');
  });

};

/**
 * Stops an app.
 *
 * This will stop all services/containers that have been defined for this app.
 *
 * @since 3.0.0
 * @fires pre-stop
 * @fires post-stop
 * @param {Object} app - A fully instantiated app object
 * @returns {Promise} A Promise.
 * @example
 *
 * // Stop the app
 * return lando.app.stop(app)
 *
 * // Catch any errors
 * catch(function(err) {
 *   lando.log.error(err);
 * });
 *
 */
exports.stop = function(app) {

  // Stop it!
  app.status('Stopping %s', app.name);

  // Report to metrics.
  return lando.metrics.reportAction('stop', {app: app})

  // Make sure we are in a clean place before we get dirty
  .then(function() {
    return _app.cleanup(app);
  })

  /**
   * Event that runs before an app stops.
   *
   * @since 3.0.0
   * @event module:app.event:pre-stop
   * @example
   *
   * // Stop a DNS server before our app stops.
   * app.events.on('pre-stop', function() {
   *   return lando.engine.stop(dnsServer);
   * });
   */
  .then(function() {
    return app.events.emit('pre-stop');
  })

  // Stop components.
  .then(function() {
    return lando.engine.stop(app);
  })

  /**
   * Event that runs after an app stop.
   *
   * @since 3.0.0
   * @event module:app.event:post-stop
   * @example
   *
   * // Stop a DNS server after our app stops.
   * app.events.on('post-stop', function() {
   *   return lando.engine.stop(dnsServer);
   * });
   */
  .then(function() {
    return app.events.emit('post-stop');
  });

};

/**
 * Stops and then starts an app.
 *
 * This just runs `app.stop` and `app.start` in succession.
 *
 * @since 3.0.0
 * @fires pre-stop
 * @fires stop-stop
 * @fires pre-start
 * @fires post-start
 * @param {Object} app - A fully instantiated app object
 * @returns {Promise} A Promise.
 * @example
 *
 * // Restart the app
 * return lando.app.restart(app)
 *
 * // Catch any errors
 * catch(function(err) {
 *   lando.log.error(err);
 * });
 *
 */
exports.restart = function(app) {

  // Start it off
  app.status('Restarting %s', app.name);

  // Stop app.
  return _app.stop(app)

  // Start app.
  .then(function() {
    return _app.start(app);
  });

};

/**
 * Hard removes all app services, olumes, networks, etc as well as removes the
 * app from the appRegistry.
 *
 * This differs from `uninstall` in that uninstall will only soft remove all app
 * services, while maintaining things like volumes, networks, etc as well as an
 * entry in the appRegistry.
 *
 * That said this DOES call both `stop` and `uninstall`.
 *
 * @since 3.0.0
 * @fires pre-destroy
 * @fires pre-stop
 * @fires post-stop
 * @fires pre-uninstall
 * @fires post-uninstall
 * @fires post-destroy
 * @param {Object} app - A fully instantiated app object
 * @returns {Promise} A Promise.
 * @example
 *
 * // Destroy the app
 * return lando.app.destroy(app)
 *
 * // Catch any errors
 * catch(function(err) {
 *   lando.log.error(err);
 * });
 *
 */
exports.destroy = function(app) {

  // Start it off
  app.status('Destroying %s', app.name);

  /**
   * Event that runs before an app is destroyed.
   *
   * @since 3.0.0
   * @event module:app.event:pre-destroy
   * @example
   *
   * // Make sure the proxy is down before we destroy
   * app.events.on('pre-destroy', function() {
   *   if (fs.existsSync(proxyFile)) {
   *     return lando.engine.stop(getProxy(proxyFile));
   *   }
   * });
   */
  return app.events.emit('pre-destroy')

  // Make sure app is stopped.
  .then(function() {
    return _app.stop(app);
  })

  // Uninstall app.
  .then(function() {
    app.opts = _.merge(app.opts, {purge: true});
    return _app.uninstall(app);
  })

  // Remove from appRegistry
  .then(function() {
    return registry.remove({name: app.name});
  })

  /**
   * Event that runs after an app is destroyed.
   *
   * @since 3.0.0
   * @event module:app.event:post-destroy
   * @example
   *
   * // Make sure the proxy is up brought back up after we destroy
   * app.events.on('post-destroy', function() {
   *   return startProxy();
   * });
   */
  .then(function() {
    return app.events.emit('post-destroy');
  });

};

/**
 * Rebuilds an app.
 *
 * This will stop an app, soft remove its services, rebuild those services and
 * then, finally, start the app back up again. This is useful for developers who
 * might want to tweak Dockerfiles or compose yamls.
 *
 * @since 3.0.0
 * @fires pre-stop
 * @fires post-stop
 * @fires pre-uninstall
 * @fires post-uninstall
 * @fires pre-start
 * @fires post-start
 * @param {Object} app - A fully instantiated app object
 * @returns {Promise} A Promise.
 * @example
 *
 * // Destroy the app
 * return lando.app.destroy(app)
 *
 * // Catch any errors
 * catch(function(err) {
 *   lando.log.error(err);
 * });
 *
 */
exports.rebuild = function(app) {

  // Start it off
  app.status('Rebuilding %s', app.name);

  // Stop app.
  return _app.stop(app)

  /**
   * Event that runs before an app is rebuilt.
   *
   * @since 3.0.0
   * @event module:app.event:pre-rebuild
   * @example
   *
   * // Do something
   * app.events.on('post-rebuild', function() {
   *   // Do something
   * });
   */
  .then(function() {
    return app.events.emit('pre-rebuild');
  })

  // Uninstall app
  .then(function() {
    return _app.uninstall(app);
  })

  // Repull/build components.
  .then(function() {
    return lando.engine.build(app);
  })

  /**
   * Event that runs after an app is rebuilt.
   *
   * @since 3.0.0
   * @event module:app.event:post-rebuild
   * @example
   *
   * // Do something
   * app.events.on('post-rebuild', function() {
   *   // Do something
   * });
   */
  .then(function() {
    return app.events.emit('post-rebuild');
  })

  // Install app.
  .then(function() {
    return _app.start(app);
  });

};
