'use strict';

// Modules
const chalk = require('chalk');

// Helper to handle messaging, based on if any excludes were provided
const handleMessaging = options => {
  let message = 'NO!! SHUT IT ALL DOWN! Spinning Lando containers down...';
  if (options.exclude.length) {
    message = 'Excluded apps detected. Spinning other Lando containers down... Global containers will be skipped.';
  }
  return message;
};

// Helper to handle filtering containers based on excluded app(s)
const handlefilteringContainers = (container, options) => {
  let keep = true;
  if (options.exclude.length) keep = !options.exclude.includes(container.app) && container.app !== '_global_';
  return keep;
};

module.exports = lando => {
  return {
    command: 'poweroff',
    level: 'engine',
    describe: 'Spins down all lando related containers',
    options: {
      exclude: {
        describe: 'Exclude containers from one or more apps from being shut down',
        alias: ['e'],
        default: [],
        array: true,
      },
    },
    run: options => {
      console.log(chalk.green(handleMessaging(options)));
      // Get all our containers
      return lando.engine.list()
      // If we have any excludes, filter them and any global containers (e.g. proxy) out
      .filter(container => handlefilteringContainers(container, options))
      // SHUT IT ALL DOWN
      .each(container => console.log('Bye bye %s ... ', container.name, chalk.green('done')))
      .each(container => lando.engine.stop({id: container.id}))
      // Emit poweroff
      .then(() => lando.events.emit('poweroff'))
      // Finish up
      .then(() => {
        console.log(chalk.red('Lando containers have been spun down.'));
      });
    },
  };
};
