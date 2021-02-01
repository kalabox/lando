'use strict';

// Modules
const _ = require('lodash');
const getUser = require('./../../../lib/utils').getUser;
const utils = require('./../lib/utils');

// Other things
const bashme = ['/bin/sh', '-c', 'if ! type bash > /dev/null; then sh; else bash; fi'];
const task = {
  command: 'ssh',
  describe: 'Drops into a shell on a service, runs commands',
  options: {
    service: {
      describe: 'SSH into this service',
      alias: ['s'],
      default: 'appserver',
    },
    command: {
      describe: 'Run a command in the service',
      alias: ['c'],
    },
    user: {
      describe: 'Run as a specific user',
      alias: ['u'],
    },
  },
};

module.exports = lando => {
  task.run = ({appname = undefined, command = bashme, service = 'appserver', user = null, _app = {}} = {}) => {
    // Try to get our app
    const app = lando.getApp(_app.root, false);
    // If we have it then init and DOOOO EEEET
    if (app) {
      return app.init().then(() => {
        if (_.isNull(user)) user = getUser(service, app.info);
        return lando.engine.run(utils.buildCommand(app, command, service, user).dockerRunner).catch(error => {
          error.hide = true;
          throw error;
        });
      });
    }
  };
  return task;
};
