'use strict';

// Modules
const _ = require('lodash');
const utils = require('./utils');

/*
 * Helper to build tasks from metadata
 */
module.exports = (config, injected) => {
  // Get our defaults and such
  const {name, app, cmd, describe, dir, env, options, service, stdio, user} = utils.toolingDefaults(config);
  // Handle dynamic services and passthrough options right away
  // Get the event name handler
  const eventName = name.split(' ')[0];
  const run = answers => injected.Promise.try(() => (_.isEmpty(app.compose)) ? app.init() : true)
    // Kick off the pre event wrappers
    .then(() => app.events.emit(`pre-${eventName}`, config, answers))
    // Get an interable of our commandz
    .then(() => _.map(utils.parseConfig(cmd, service, options, answers)))
    // Build run objects
    .map(({command, service}) => utils.buildCommand(app, command, service, user, env, dir))
    // Try to run the task quickly first and then fallback to compose launch
    .each(command => utils.dockerExec(injected, stdio, command).catch(execError => {
      return injected.engine.isRunning(command.dockerRunner.id).then(isRunning => {
        if (!isRunning) {
          return injected.engine.run(command.dockerRunner).catch(composeError => {
            composeError.hide = true;
            throw composeError;
          });
        } else {
          execError.hide = true;
          throw execError;
        }
      });
    }))
    // Post event
    .then(() => app.events.emit(`post-${eventName}`, config, answers));

  // Return our tasks
  return {
    command: name,
    describe,
    run,
    options,
  };
};
