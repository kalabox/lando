'use strict';

// Modules
const _ = require('lodash');
const escape = require('./../../../lib/utils').shellEscape;
const getUser = require('./../../../lib/utils').getUser;
const getCliEnvironment = require('./../../../lib/utils').getCliEnvironment;
const path = require('path');
const Command = require('./../../../lib/command');

/*
 * Helper to map the cwd on the host to the one in the container
 */
const getContainerPath = appRoot => {
  // Break up our app root and cwd so we can get a diff
  const cwd = process.cwd().split(path.sep);
  const dir = _.drop(cwd, appRoot.split(path.sep).length);
  // Add our in-container app root
  // this will always be /app
  dir.unshift('/app');
  // Return the directory
  return dir.join('/');
};

/*
 * Build docker exec opts
 */
const getExecOpts = (docker, datum) => {
  const exec = [docker, 'exec'];
  // Should only use this if we have to
  if (process.stdin.isTTY) exec.push('--tty');
  // Should only set interactive in node mode
  if (process.lando === 'node') exec.push('--interactive');
  // Add user and workdir
  exec.push('--user');
  exec.push(datum.opts.user);
  exec.push('--workdir');
  exec.push(datum.opts.workdir);
  // Add envvvars
  _.forEach(datum.opts.environment, (value, key) => {
    exec.push('--env');
    exec.push(`${key}=${value}`);
  });
  // Add id
  exec.push(datum.id);
  return exec;
};

/*
 * Helper to get dynamic service keys for stripping
 */
const getDynamicKeys = (answer, answers = {}) => _(answers)
  .map((value, key) => ({key, value}))
  .filter(data => data.value === answer)
  .map(data => data.key)
  .map(key => (_.size(key) === 1) ? `-${key}` : `--${key}`)
  .value();

/*
 * Helper to handle dynamic services
 *
 * Set SERVICE from answers and strip out that noise from the rest of
 * stuff, check answers/argv for --service or -s, validate and then remove
 */
const handleDynamic = (config, options = {}, answers = {}) => {
  if (_.startsWith(config.service, ':')) {
    const answer = answers[config.service.split(':')[1]];
    // Remove dynamic service option from argv
    _.remove(process.argv, arg => _.includes(getDynamicKeys(answer, answers).concat(answer), arg));
    // Return updated config
    return _.merge({}, config, {service: answers[config.service.split(':')[1]]});
  } else {
    return config;
  }
};

/*
 * Helper to process args
 *
 * We assume pass through commands so let's use argv directly and strip out
 * the first three assuming they are [node, lando.js, options.name]'
 * Check to see if we have global lando opts and remove them if we do
 */
const handleOpts = (config, argopts = []) => {
  // Append any user specificed opts
  argopts = argopts.concat(process.argv.slice(3));
  // If we have no args then just return right away
  if (_.isEmpty(argopts)) return config;
  // Return
  return _.merge({}, config, {args: argopts});
};

/*
 * Helper to get passthru options
 */
const handlePassthruOpts = (options = {}, answers = {}) => _(options)
  .map((value, key) => _.merge({}, {name: key}, value))
  .filter(value => value.passthrough === true && !_.isNil(answers[value.name]))
  .map(value => `--${value.name}=${answers[value.name]}`)
  .value();

/*
 * Helper to convert a command into config object
 */
const parseCommand = (cmd, service) => ({
  command: (_.isObject(cmd)) ? cmd[_.first(_.keys(cmd))] : cmd,
  service: (_.isObject(cmd)) ? _.first(_.keys(cmd)) : service,
});

/*
 * Helper to build commands
 */
exports.buildCommand = (app, command, service, user, env = {}, dir = undefined) => {
  const dockerRunner = {
    id: `${app.project}_${service}_1`,
    compose: app.compose,
    project: app.project,
    cmd: command,
    opts: {
      environment: getCliEnvironment(env),
      mode: 'attach',
      workdir: dir || getContainerPath(app.root),
      user: (user === null) ? getUser(service, app.info) : user,
      services: _.compact([service]),
      hijack: false,
      autoRemove: true,
    },
  };

  return new Command(app, service, command, dockerRunner);
};

/*
 * Helper to build docker exec command
 */
exports.dockerExec = (injected, stdio, command) => {
  const datum = command.dockerRunner;
  // Depending on whether injected is the app or lando
  const dockerBin = injected.config.dockerBin || injected._config.dockerBin;
  const opts = {mode: 'attach', cstdio: stdio};
  // Run run run

  let shOptions;

  if (command.service === '_host_') {
    shOptions = datum.cmd;
  } else {
    shOptions = getExecOpts(dockerBin, datum).concat(datum.cmd);
  }

  return injected.shell.sh(shOptions, opts);
};

/*
 * Helper to get tts
 */
exports.getToolingTasks = (config, app) => _(config)
  .map((task, name) => _.merge({}, task, {app, name}))
  .filter(task => _.isObject(task))
  .value();

/*
 * Helper to parse tooling config options
 */
exports.parseConfig = (cmd, service, options = {}, answers = {}) => _(cmd)
  // Put into an object so we can handle "multi-service" tooling
  .map(cmd => parseCommand(cmd, service))
  // Handle dynamic services
  .map(config => handleDynamic(config, options, answers))
  // Add in any argv extras if they've been passed in
  .map(config => handleOpts(config, handlePassthruOpts(options, answers)))
  // Wrap the command in /bin/sh if that makes sense
  .map(config => _.merge({}, config, {command: escape(config.command, true, config.args)}))
  // Add any args to the command and compact to remove undefined
  .map(config => _.merge({}, config, {command: _.compact(config.command.concat(config.args))}))
  // Put into an object
  .value();

/*
 * Helper to get defaults
 */
exports.toolingDefaults = ({
  name,
  app = {},
  cmd = name,
  dir,
  description = `Runs ${name} commands`,
  env = {},
  options = {},
  service = '',
  stdio = ['inherit', 'pipe', 'pipe'],
  user = null,
  } = {}) =>
  ({
    name,
    app: app,
    cmd: !_.isArray(cmd) ? [cmd] : cmd,
    dir,
    env,
    describe: description,
    options: options,
    service: service,
    stdio: stdio,
    user,
  });
