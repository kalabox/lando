'use strict';

const chalk = require('chalk');
const utils = require('./../lib/utils');

// Helper to poweroff existing app, if applicable
const handleOptionalPoweroff = (lando, options) => {
  let maybePoweroff;
  if (options.only) {
    const _ = require('lodash');
    const poweroff = _.find(lando.tasks, {command: 'poweroff'});
    console.log(
      chalk.green('There can be only one! Preparing to spin down other Lando apps before starting this one...')
    );
    maybePoweroff = poweroff.run({exclude: []});
  } else {
    maybePoweroff = lando.Promise.resolve('Nothing to see here...');
  }
  return maybePoweroff;
};

module.exports = lando => {
  const table = lando.cli.makeTable();
  return {
    command: 'start',
    describe: 'Starts your app',
    options: {
      only: {
        describe: 'Shut down any other running apps before starting this one',
        alias: ['o'],
        default: false,
        boolean: true,
      },
    },
    run: options => {
      // Try to get our app
      const app = lando.getApp(options._app.root);
      // Start it if we can!
      if (app) {
        // Wait for the optional poweroff to complete before starting this app
        handleOptionalPoweroff(lando, options)
        .then(() => {
          console.log(chalk.green('Let\'s get this party started! Starting app...'));
        })
        .then(() => utils.appToggle(app, 'start', table, lando.cli.makeArt()));
      }
    },
  };
};
