'use strict';

// Modules
const _ = require('lodash');
const formatters = require('./formatters');
const fs = require('fs');
const os = require('os');
const path = require('path');

// Global options
const globalOptions = {
  channel: {
    describe: 'Sets the update channel',
    choices: ['edge', 'none', 'stable'],
    global: true,
    type: 'array',
  },
  clear: {
    describe: 'Clears the lando tasks cache',
    global: true,
    type: 'boolean',
  },
  experimental: {
    describe: 'Activates experimental features',
    global: true,
    type: 'boolean',
  },
  help: {
    describe: 'Shows lando or delegated command help if applicable',
    type: 'boolean',
  },
  lando: {
    hidden: true,
    type: 'boolean',
  },
  verbose: {
    alias: 'v',
    describe: 'Runs with extra verbosity',
    type: 'count',
  },
};

/*
 * Construct the CLI
 */
module.exports = class Cli {
  constructor(prefix = 'LANDO', logLevel = 'warn', userConfRoot = path.join(os.homedir(), '.lando')) {
    this.prefix = prefix;
    this.logLevel = logLevel;
    this.userConfRoot = userConfRoot;
  };

  /**
   * Returns a parsed array of CLI arguments and options
   *
   * @since 3.0.0
   * @alias lando.cli.argv
   * @return {Object} Yarg parsed options
   * @example
   * const argv = lando.cli.argv();
   * @todo make this static and then fix all call sites
   */
  argv() {
    return require('yargs').help(false).version(false).argv;
  };

  /**
   * Checks to see if lando is running with sudo. If it is it
   * will exit the process with a stern warning
   *
   * @since 3.0.0
   * @alias lando.cli.checkPerms
   * @example
   * lando.cli.checkPerms()
   */
  checkPerms() {
    const sudoBlock = require('sudo-block');
    sudoBlock(this.makeArt('sudoRun'));
  };

  /*
   * Toggle the secret toggle
   */
  clearTaskCaches() {
    if (fs.existsSync(process.landoTaskCacheFile)) fs.unlinkSync(process.landoTaskCacheFile);
    if (fs.existsSync(process.landoAppTaskCacheFile)) fs.unlinkSync(process.landoAppTaskCacheFile);
  };

  /*
   * Confirm question
   */
  confirm(message = 'Are you sure?') {
    return {
      describe: 'Auto answer yes to prompts',
      alias: ['y'],
      default: false,
      boolean: true,
      interactive: {
        type: 'confirm',
        default: false,
        message: message,
      },
    };
  };

  /**
   * Returns a config object with some good default settings for bootstrapping
   * lando as a command line interface
   *
   * @since 3.0.0
   * @alias lando.cli.defaultConfig
   * @return {Object} Config that can be used in a Lando CLI bootstrap
   * @example
   * const config = lando.cli.defaultConfig();
   * // Kick off our bootstrap
   * bootstrap(config).then(lando => console.log(lando));
   */
  defaultConfig() {
    const srcRoot = path.resolve(__dirname, '..');
    const version = require(path.join(__dirname, '..', 'package.json')).version;
    const pluginDirs = [
      srcRoot,
      {path: path.join(srcRoot, 'integrations'), subdir: '.'},
      this.userConfRoot,
    ];

    return {
      alliance: fs.existsSync(path.join(this.userConfRoot, 'secret-toggle')),
      channel: 'stable',
      configSources: [path.join(srcRoot, 'config.yml'), path.join(this.userConfRoot, 'config.yml')],
      command: this.argv(),
      domain: 'lndo.site',
      experimental: false,
      envPrefix: this.prefix,
      landoFile: '.lando.yml',
      leia: _.has(process, 'env.LEIA_PARSER_RUNNING'),
      logLevelConsole: (this.argv().verbose) ? this.argv().verbose + 1 : this.logLevel,
      logDir: path.join(this.userConfRoot, 'logs'),
      mode: 'cli',
      packaged: _.has(process, 'pkg'),
      pluginDirs: _.compact(pluginDirs.concat(process.landoAppPluginDirs)),
      preLandoFiles: ['.lando.base.yml', '.lando.dist.yml', '.lando.upstream.yml'],
      postLandoFiles: ['.lando.local.yml'],
      product: 'lando',
      userConfRoot: this.userConfRoot,
      userAgent: `Lando/${version}`,
      version,
    };
  };

  /*
   * Format data
   */
  formatData(data, {path = '', format = 'default', filter = []} = {}, opts = {}) {
    return formatters.formatData(data, {path, format, filter}, opts);
  };

  /*
   * FormatOptios
   */
  formatOptions(omit = []) {
    return formatters.formatOptions(omit);
  };

  /**
   * Cli wrapper for error handler
   *
   * @since 3.0.0
   * @alias lando.cli.handleError
   * @param {Error} error The error
   * @param {Function} handler The error handler function
   * @param {Integer} verbose [verbose=this.argv().verbose] The verbosity level
   * @param {Object} lando The Lando object
   * @return {Integer} The exit codes
   */
  handleError(error, handler, verbose = this.argv().verbose, lando = {}) {
    // Set the verbosity
    error.verbose = verbose;
    // Ask question if we haven't sent error reporting yet
    return lando.Promise.try(() => {
      if (_.isNil(lando.cache.get('report_errors'))) {
        const inquirer = require('inquirer');
        console.error(this.makeArt('crash'));
        const test = {
          name: 'reportErrors',
          type: 'confirm',
          default: true,
          message: 'Send crash reports?',
        };
        return inquirer.prompt([test]).then(answers => {
          lando.cache.set('report_errors', answers.reportErrors, {persist: true});
        });
      }
    })
    // Report error if user has error reporting on
    .then(() => handler.handle(error, lando.cache.get('report_errors')).then(code => process.exit(code)));
  };

  /*
   * Init
   */
  init(yargs, tasks, config, userConfig) {
    // Define usage
    const cmd = !_.has(process, 'pkg') ? '$0' : path.basename(_.get(process, 'execPath', 'lando'));
    const usage = [`Usage: ${cmd} <command> [args] [options]`];
    if (userConfig.experimental) {
      usage.push(`${this.makeArt('print', {text: '(experimental mode)', color: 'magenta'})}`);
    }

    // Yargs!
    yargs.usage(usage.join(' '))
      .demandCommand(1, 'You need at least one command before moving on')
      .example('lando start', 'Run lando start')
      .example('lando rebuild --help', 'Get help about using the lando rebuild command')
      .example('lando destroy -y -vvv', 'Run lando destroy non-interactively and with maximum verbosity')
      .example('lando --clear', 'Clear the lando tasks cache')
      .middleware([(argv => {
        argv._app = config;
      })])
      .recommendCommands()
      .wrap(yargs.terminalWidth() * 0.70)
      .option('channel', globalOptions.channel)
      .option('clear', globalOptions.clear)
      .option('experimental', globalOptions.experimental)
      .help(false)
      .option('lando', globalOptions.lando)
      .option('help', globalOptions.help)
      .option('verbose', globalOptions.verbose)
      .version(false);

    // Loop through the tasks and add them to the CLI
    _.forEach(_.sortBy(tasks, 'command'), task => {
      if (_.has(task, 'handler')) yargs.command(task);
      else yargs.command(this.parseToYargs(task));
    });

    // Show help unless this is a delegation command
    const current = _.find(tasks, {command: yargs.argv._[0]});
    if ((yargs.argv.help || yargs.argv.lando) && _.get(current, 'delegate', false) === false) {
      yargs.showHelp('log');
      process.exit(0);
    }

    // YARGZ MATEY
    return yargs.argv;
  }


  /**
   * Returns some cli "art"
   *
   * @since 3.0.0
   * @alias lando.cli.makeArt
   * @param {String} [func='start'] The art func you want to call
   * @param {Object} [opts] Func options
   * @return {String} Usually a printable string
   * @example
   * console.log(lando.cli.makeArt('secretToggle', true);
   */
  makeArt(func, opts) {
    return require('./art')[func](opts);
  };

  /**
   * Parses a lando task object into something that can be used by the [yargs](http://yargs.js.org/docs/) CLI.
   *
   * A lando task object is an abstraction on top of yargs that also contains some
   * metadata about how to interactively ask questions on both a CLI and GUI.
   *
   * @since 3.0.0
   * @alias lando.cli.parseToYargs
   * @see [yargs docs](http://yargs.js.org/docs/)
   * @see [inquirer docs](https://github.com/sboudrias/Inquirer.js)
   * @param {Object} task A Lando task object (@see add for definition)
   * @param {Object} [events=new AsyncEvents()] An AsyncEvents
   * @return {Object} A yargs command object
   * @example
   * // Add a task to the yargs CLI
   * yargs.command(lando.tasks.parseToYargs(task));
   */
  parseToYargs({command, describe, options = {}, run = {}, level = 'app'}) {
    const handler = argv => {
      // Immediately build some arg data set opts and interactive options
      const data = {options: argv, inquiry: formatters.getInteractive(options, argv)};
      // Remove legacy secret toggle if still there
      const secretToggleFile = path.join(this.defaultConfig().userConfRoot, 'secret-toggle');
      if (fs.existsSync(secretToggleFile)) fs.unlinkSync(secretToggleFile);

      // Summon lando
      const Lando = require('./../lib/lando');
      const lando = new Lando(this.defaultConfig());

      // Handle uncaught things
      _.forEach(['unhandledRejection', 'uncaughtException'], exception => {
        process.on(exception, error => this.handleError(error, lando.error, this.argv().verbose, lando));
      });

      // Fetch updates async if we need them
      if (lando.config.channel !== 'none') {
        if (lando.updates.fetch(lando.cache.get('updates'))) {
          lando.log.debug('Checking for updates...');
          lando.updates.refresh(lando.config.version, lando.config.channel === 'edge').then(latest => {
            lando.cache.set('updates', latest, {persist: true});
            lando.log.verbose('Got new lando version info!', latest);
          });
        }
        // Show the update message if it makes sense
        const updateInfo = lando.cache.get('updates');
        if (_.has(updateInfo, 'version') && _.has(updateInfo, 'url')) {
          if (lando.updates.updateAvailable(lando.config.version, updateInfo.version)) {
            console.error(lando.cli.makeArt('updateAvailable', updateInfo.url));
          } else {
            lando.log.debug('No update available.');
          }
        }
      }

      // Check for updates and get things started
      return lando.bootstrap(level).then(lando => {
        return lando.Promise.try(() => {
          // If this bootstrap level requires the engine lets do some dependency checks
          if (lando.BOOTSTRAP_LEVELS[level] >= 3) {
            // Throw NO DOCKER error
            lando.log.verbose('docker-engine exists: %s', lando.engine.dockerInstalled);
            if (lando.engine.dockerInstalled === false) {
              console.error(this.makeArt('noDockerDep'));
              throw Error('docker could not be located!');
            }
            // Throw NO DOCKER COMPOSE error
            lando.log.verbose('docker-compose exists: %s', lando.engine.composeInstalled);
            if (lando.engine.composeInstalled === false) {
              console.error(this.makeArt('noDockerDep', 'docker-compose'));
              throw Error('docker-compose could not be located!');
            }
            // Collect DOCKER VERSION COMPAT info, this can be an async check
            lando.engine.getCompatibility().then(results => {
              lando.log.verbose('checking docker version compatibility...');
              lando.log.debug('compatibility results', _.keyBy(results, 'name'));
              lando.cache.set('versions', _.assign(lando.versions, _.keyBy(results, 'name')), {persist: true});
              lando.versions = lando.cache.get('versions');
            });
            // Show a message saying we are starting docker if its not up, we can also do this async
            // because the auto-start mechanism is downstream, this is just to surface a message
            lando.engine.daemon.isUp().then(isUp => {
              if (!isUp) {
                lando.log.warn('docker is not running!');
                console.log('Starting docker up before we begin... please wait...');
              } else {
                lando.log.debug('docker is running.');
              }
            });
          }
        })
        /**
         * Event that allows altering of argv or inquirer before interactive prompts
         * are run
         *
         * You will want to replace CMD with the actual task name eg `task-start-answers`.
         *
         * @since 3.0.0
         * @event task_CMD_answers
         * @property {Object} answers argv and inquirer questions
         */
        .then(() => lando.events.emit('cli-answers', data, argv._[0]))
        .then(() => lando.events.emit(`cli-${argv._[0]}-answers`, data, argv._[0]))

        // Attempt to filter out questions that have already been answered
        // Prompt the use for feedback if needed and sort by weight
        .then(() => formatters.handleInteractive(data.inquiry, data.options, command, lando))

        /**
         * Event that allows final altering of answers before the task runs
         *
         * You will want to replace CMD with the actual task name eg `task-start-run`.
         *
         * @since 3.0.0
         * @event task_CMD_run
         * @property {Object} answers object
         */
        .then(answers => lando.events.emit('cli-run', _.merge(data.options, answers), argv._[0]))
        .then(() => lando.events.emit(`cli-${argv._[0]}-run`, data, argv._[0]))

        // Find and run the task, unless we already have one
        // @TODO: somehow handle when commands break eg change task name, malformed tasks
        .then(() => {
          if (_.isFunction(run)) return run(data.options, lando);
          else return _.find(lando.tasks, {command}).run(data.options);
        })

        // Add a final event for other stuff
        .then(() => lando.events.emit('before-end'))

        // Handle all other errors eg likely things that happen pre bootstrap
        .catch(error => this.handleError(error, lando.error, this.argv().verbose, lando))
        // If we caught an error that resulted in an error code lets make sure we exit non0
        .finally(() => process.exit(_.get(lando, 'exitCode', 0)));
      });
    };

    // Return our yarg command
    return {command, describe, builder: formatters.sortOptions(options), handler};
  };

  /*
   * Run the CLI
   */
  run(tasks = [], config = {}) {
    const yargonaut = require('yargonaut');
    yargonaut.style('green').errorsStyle('red');
    const yargs = require('yargs');
    const {clear, channel, experimental, secretToggle} = yargs.argv;

    // Handle global flag error conditions first
    if (secretToggle && this.defaultConfig().packaged) {
      console.error(this.makeArt('secretToggleDenied'));
      process.exit(1);
    }
    if (channel && !_.includes(globalOptions.channel.choices, channel)) {
      console.error(this.makeArt('print', {text: `Unknown release channel: ${channel}`, color: 'red'}));
      process.exit(1);
    }

    // Handle all our configuration global opts first
    const userConfig = this.updateUserConfig();
    if (clear) console.log('Lando has cleared the tasks cache!');
    if (channel) {
      this.updateUserConfig({channel: channel});
      const updateFile = path.join(this.defaultConfig().userConfRoot, 'cache', 'updates');
      if (fs.existsSync(updateFile)) fs.unlinkSync(updateFile);
      console.log(this.makeArt('releaseChannel', channel));
    }
    if (experimental) {
      this.updateUserConfig({experimental: !userConfig.experimental});
      console.log(this.makeArt('experimental', !userConfig.experimental));
    }
    if (secretToggle) {
      this.updateUserConfig({alliance: !userConfig.alliance});
      console.log(this.makeArt('secretToggle', !userConfig.alliance));
    }
    if (clear || channel || experimental || secretToggle) {
      this.clearTaskCaches();
      process.exit(0);
    }

    // Initialize
    return this.init(yargs, tasks, config, userConfig);
  };

  /*
   * Toggle a toggle
   */
  updateUserConfig(data = {}) {
    const Yaml = require('./yaml');
    const yaml = new Yaml();
    const configFile = path.join(this.defaultConfig().userConfRoot, 'config.yml');
    const config = (fs.existsSync(configFile)) ? yaml.load(configFile) : {};
    const file = yaml.dump(configFile, _.assign({}, config, data));
    return yaml.load(file);
  }
};
