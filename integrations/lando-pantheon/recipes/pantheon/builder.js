'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const pull = require('./../../lib/pull');
const push = require('./../../lib/push');
const change = require('./../../lib/switch');
const utils = require('./../../lib/utils');

const overrideAppserver = options => {
  // Use our custom pantheon images
  options.services.appserver.overrides.image = `devwithlando/pantheon-appserver:${options.php}-2`;
  // Add in the prepend.php
  // @TODO: this throws a weird DeprecationWarning: 'root' is deprecated, use 'global' for reasons not immediately clear
  // So we are doing this a little weirdly to avoid hat until we can track things down better
  options.services.appserver.overrides.volumes.push(`${options.confDest}/prepend.php:/srv/includes/prepend.php`);
  // Add in our environment
  options.services.appserver.overrides.environment = utils.getPantheonEnvironment(options);
  return options;
};

const setTooling = (options, tokens) => {
  const metaToken = _.get(
    options,
    '_app.meta.token',
    null
  );
  const tokenEnv = metaToken !== null ?
    {LANDO_TERMINUS_TOKEN: metaToken}
    : {};
  // Add in push/pull/switch
  options.tooling.pull = pull.getPantheonPull(options, tokens);
  options.tooling.push = push.getPantheonPush(options, tokens);
  options.tooling.switch = change.getPantheonSwitch(options, tokens);
  // Add in the framework-correct tooling
  options.tooling = _.merge({}, options.tooling, utils.getPantheonTooling(options.framework));
  // Inject token into the environment for all relevant tooling defined by recipe.
  ['push', 'pull', 'switch'].forEach(command => {
    options.tooling[command].env = _.merge({}, tokenEnv, options.tooling[command].env);
  });
  return options;
};

const setBuildSteps = options => {
  // Get build steps
  options.build = utils.getPantheonBuildSteps(options.framework, options.drush).concat(options.build);
  // Add in our pantheon scripts
  // NOTE: We do this here instead of in /scripts because we need to guarantee
  // it runs before the other build steps so it can reset our CA correctly
  options.build_root.push('/helpers/pantheon.sh');
  options.build.push('/helpers/auth.sh');
  options.run_root.push('/helpers/binding.sh');
  // Add composer install step
  if (options.build_step) options.build.unshift('composer install');
  return options;
};

/*
 * Build Drupal 7
 */
module.exports = {
  name: 'pantheon',
  parent: '_lamp',
  config: {
    build: [],
    build_root: [],
    run_root: [],
    cache: true,
    confSrc: __dirname,
    defaultFiles: {
      php: 'php.ini',
      database: 'mysql.cnf',
      server: 'nginx.conf.tpl',
    },
    edge: true,
    env: 'dev',
    framework: 'drupal',
    index: true,
    services: {appserver: {overrides: {
      volumes: [],
    }}},
    tooling: {terminus: {
      service: 'appserver',
    }},
    xdebug: false,
    webroot: '.',
  },
  builder: (parent, config) => class LandoPantheon extends parent {
    constructor(id, options = {}) {
      // Merge in pantheon ymlz
      options = _.merge({}, config, options, utils.getPantheonConfig([
        path.join(options.root, 'pantheon.upstream.yml'),
        path.join(options.root, 'pantheon.yml'),
        path.join(options.root, 'pantheon.local.yml'),
      ]));

      // Normalize because 7.0 right away gets handled strangely by js-yaml
      if (options.php === '7' || options.php === 7) options.php = '7.0';

      // Reset the drush version if we have a composer.json entry
      const composerFile = path.join(options.root, 'composer.json');
      if (fs.existsSync(composerFile)) {
        const composerConfig = require(composerFile);
        options.drush_version = _.get(composerConfig, `require['drush/drush']`, options.drush);
      }

      // Enforce certain options for pantheon parity
      options.via = 'nginx:1.16';
      options.database = (options.framework === 'drupal9') ? 'mariadb:10.4': 'mariadb:10.1';

      // Set correct things based on framework
      options.defaultFiles.vhosts = `${options.framework}.conf.tpl`;
      options = overrideAppserver(options);
      // Add in cache if applicable
      if (options.cache) options = _.merge({}, options, utils.getPantheonCache());
      // Add in edge if applicable
      if (options.edge) options = _.merge({}, options, utils.getPantheonEdge(options));
      // Add in index if applicable
      if (options.index) options = _.merge({}, options, utils.getPantheonIndex());

      // Handle other stuff
      const tokens = utils.sortTokens(options._app.pantheonTokens, options._app.terminusTokens);
      options = setTooling(options, tokens);
      options = setBuildSteps(options);

      // Send downstream
      super(id, options);
    };
  },
};
