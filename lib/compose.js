/**
 * Module to wrap and abstract access to docker compose.
 *
 * @module compose
 */

'use strict';

// Modules
var _ = require('./node')._;
var config = require('./config');
var fs = require('./node').fs;
var path = require('path');
var shell = require('./shell');
var yaml = require('./yaml');

// Get some composer things
var COMPOSE_EXECUTABLE = config.composeBin;

/*
 * Run a provider command in a shell.
 */
var shCompose = function(cmd, opts) {
  return shell.sh([COMPOSE_EXECUTABLE].concat(cmd), opts);
};

/*
 * Figure out what to do with the compose data we have
 * and then return a files array
 */
var parseComposeData = function(compose, project) {

  // Start up a collector of files
  var files = [];

  // Export our compose stuff and add to commands
  // @todo: this whole thing might be deprecated at this point?
  _.forEach(compose, function(unit) {

    // Create files where we need to otherwise use the ones provided
    if (typeof unit === 'object') {

      // Create temp stuff
      var tmpDir = path.join(config.userConfRoot, 'tmp', project);
      fs.mkdirpSync(tmpDir);

      // Generate a new compose file and add to our thing
      var fileName = [project, _.uniqueId()].join('-') + '.yml';
      var newComposeFile = path.join(tmpDir, fileName);
      yaml.dump(newComposeFile, unit);
      unit = newComposeFile;

    }

    // Add in our unit
    files.push('--file');
    files.push(unit);

  });

  // Return all the files
  return files;

};

/*
 * Expand dirs/files to an array of compose files options
 */
var parseComposeOptions = function(compose, project, opts) {

  // A project is required
  if (!project) {
    throw new Error('Need to give this composition a project name!');
  }

  // Kick off options
  var options = ['--project-name', project];

  // Get our array of compose files
  var files = parseComposeData(compose, project, opts);

  // Return our compose option
  return options.concat(files);

};

/*
 * Parse general docker options
 */
var parseOptions = function(opts) {

  // Start flag collector
  var flags = [];

  // Return empty if we have no opts
  if (!opts) {
    return flags;
  }

  // Inspect opts
  if (opts.q) {
    flags.push('-q');
  }

  // Daemon opts
  if (opts.background) {
    flags.push('-d');
  }

  // Recreate opts
  if (opts.recreate) {
    flags.push('--force-recreate');
  }

  // Remove orphans
  if (opts.removeOrphans) {
    flags.push('--remove-orphans');
  }

  // Cache opts
  if (opts.nocache) {
    flags.push('--no-cache');
  }

  // Pull opts
  if (opts.pull) {
    flags.push('--pull');
  }

  // Removal opts
  if (opts.force) {
    flags.push('--force');
  }
  if (opts.volumes) {
    flags.push('-v');
  }

  // Log opts
  if (opts.follow) {
    flags.push('--follow');
  }
  if (opts.timestamps) {
    flags.push('--timestamps');
  }

  // Run options
  // Do not start linked containers
  if (opts.noDeps) {
    flags.push('--no-deps');
  }

  // Change the entrypoint
  if (opts.entrypoint) {
    flags.push('--entrypoint');
    if (_.isArray(opts.entrypoint)) {
      flags.push(shell.escSpaces(opts.entrypoint.join(' ')));
    }
    else {
      flags.push(opts.entrypoint);
    }
  }

  // Remove the container after the run is done
  if (opts.rm) {
    flags.push('--rm');
  }

  // Add additional ENVs
  if (opts.environment) {
    _.forEach(opts.environment, function(envVar) {
      flags.push('-e');
      flags.push(envVar);
    });
  }

  // Return any and all flags
  return flags;

};

/*
 * Helper to standardize construction of docker commands
 */
var buildCmd = function(compose, project, run, opts) {

  // Get our compose files and build the pre opts
  var cmd = parseComposeOptions(compose, project, opts).concat([run]);

  // Get options
  cmd = cmd.concat(parseOptions(opts));

  // Add in a services arg if its there
  if (opts && opts.services) {
    _.forEach(opts.services, function(service) {
      cmd.push(service);
    });
  }

  // Add in a command arg if its there
  if (opts && opts.cmd) {
    if (typeof opts.cmd === 'string') {
      opts.cmd = [opts.cmd];
    }
    if (_.isArray(opts.entrypoint)) {
      cmd.push(shell.escSpaces(opts.cmd.join(' ')));
    }
    else {
      cmd = _.flatten(cmd.concat(opts.cmd));
    }
  }

  return cmd;

};

/*
 * You can do a create, rebuild and start with variants of this
 */
exports.start = function(compose, project, opts) {

  // Default options
  var defaults = {
    background: true,
    recreate: false,
    removeOrphans: true
  };

  // Get opts
  var options = (opts) ? _.merge(defaults, opts) : defaults;

  // Up us
  var cmd = buildCmd(compose, project, 'up', options);
  return shCompose(cmd, {
    app: opts.app,
    mode: 'collect'
  });

};

/*
 * Run docker compose pull
 */
exports.getId = function(compose, project, opts) {

  // Default options
  var defaults = {
    q: true
  };

  // Get opts
  var options = (opts) ? _.merge(defaults, opts) : defaults;

  return shCompose(
    buildCmd(compose, project, 'ps', options),
    {
      app: opts.app
    }
  );
};

/*
 * Run docker compose build
 */
exports.build = function(compose, project, opts) {

  // Default options
  var defaults = {
    nocache: true,
    pull: true
  };

  // Get opts
  var options = (opts) ? _.merge(defaults, opts) : defaults;

  // Build and run
  var cmd = buildCmd(compose, project, 'build', options);
  return shCompose(cmd, {
    app: opts.app,
    mode: 'collect'
  });

};

/*
 * Run docker compose pull
 */
exports.pull = function(compose, project, opts) {

  // Build and run
  var cmd = buildCmd(compose, project, 'pull', opts);
  return shCompose(cmd, {
    app: opts.app,
    mode: 'collect'
  });

};

/*
 * Run docker compose stop
 */
exports.stop = function(compose, project, opts) {
  var cmd = buildCmd(compose, project, 'stop', opts);
  return shCompose(cmd, {
    app: opts.app,
    mode: 'collect'
  });
};

/*
 * Run docker compose logs
 */
exports.logs = function(compose, project, opts) {

  // Default options
  var defaults = {
    follow: false,
    timestamps: false
  };

  // Get opts
  var options = (opts) ? _.merge(defaults, opts) : defaults;

  // Build the command
  var cmd = buildCmd(compose, project, 'logs', options);
  return shCompose(cmd, {
    app: opts.app,
    mode: 'attach'
  });
};

/*
 * Run docker compose remove
 */
exports.remove = function(compose, project, opts) {

  // Default down options
  var defaultDowns = {
    removeOrphans: true,
    volumes: true
  };

  // Default rm options
  var defaultRms = {
    force: true,
    volumes: true
  };

  // Get opts
  var defaults = (opts.purge) ? defaultDowns : defaultRms;
  var options = (opts) ? _.merge(defaults, opts) : defaults;

  // Get subcommand
  var subCmd = (opts.purge) ? 'down' : 'rm';

  // Build the command and run it
  var cmd = buildCmd(compose, project, subCmd, options);
  return shCompose(cmd, {
    app: opts.app,
    mode: 'collect'
  });

};
