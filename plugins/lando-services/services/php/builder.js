'use strict';

// Modules
const _ = require('lodash');
const path = require('path');
const semver = require('semver');
const utils = require('./../../lib/utils');

/*
 * Helper to get nginx config
 */
const nginxConfig = options => ({
  app: options.app,
  config: _.merge({}, {
    vhosts: `${options.confDest}/${options.defaultFiles.vhosts}`,
  }, options.config),
  confDest: path.resolve(options.confDest, '..', 'nginx'),
  info: {managed: true},
  home: options.home,
  name: `${options.name}_nginx`,
  overrides: utils.cloneOverrides(options.overrides),
  project: options.project,
  root: options.root,
  ssl: options.nginxSsl,
  type: 'nginx',
  userConfRoot: options.userConfRoot,
  webroot: options.webroot,
  version: options.via.split(':')[1],
});

const xdebugConfig = host => ([
  `client_host=${host}`,
  'discover_client_host=1',
 'log=/tmp/xdebug.log',
 'remote_enable=true',
  `remote_host=${host}`,
].join(' '));

/*
 * Helper to build a package string
 */
const pkger = (pkg, version) => (!_.isEmpty(version)) ? `${pkg}:${version}` : pkg;

/*
 * Helper to parse apache config
 */
const parseApache = options => {
  if (options.ssl) options.defaultFiles.vhosts = 'default-ssl.conf';
  options.volumes.push(`${options.confDest}/${options.defaultFiles.vhosts}:${options.remoteFiles.vhosts}`);
  if (options.version === '5.3') options.environment.APACHE_LOG_DIR = '/var/log';
  return options;
};

/*
 * Helper to parse cli config
 */
const parseCli = options => {
  options.command = [_.get(options, 'command', 'tail -f /dev/null')];
  return options;
};

/*
 * Helper to parse nginx config
 */
const parseNginx = options => {
  options.command = (process.platform !== 'win32') ? ['php-fpm'] : ['php-fpm -R'];
  options.image = 'fpm';
  options.remoteFiles.vhosts = '/opt/bitnami/nginx/conf/lando.conf';
  options.defaultFiles.vhosts = (options.ssl) ? 'default-ssl.conf.tpl' : 'default.conf.tpl';
  options.nginxSsl = options.ssl;
  options.ssl = false;
  if (process.platform === 'win32') {
    options.volumes.push(`${options.confDest}/zz-lando.conf:/usr/local/etc/php-fpm.d/zz-lando.conf`);
  }
  options.remoteFiles.pool = '/usr/local/etc/php-fpm.d/zz-lando.conf';
  return options;
};

/*
 * Helper to parse php config
 */
const parseConfig = options => {
  switch (options.via.split(':')[0]) {
    case 'apache': return parseApache(options);
    case 'cli': return parseCli(options);
    case 'nginx': return parseNginx(options);
  }
};

// Builder
module.exports = {
  name: 'php',
  config: {
    version: '7.4',
    supported: ['8.0', '7.4', '7.3', '7.2', '7.1', '7.0', '5.6', '5.5', '5.4', '5.3'],
    legacy: ['5.5', '5.4', '5.3'],
    path: [
      '/app/vendor/bin',
      '/app/bin',
      '/usr/local/sbin',
      '/usr/local/bin',
      '/usr/sbin',
      '/usr/bin',
      '/sbin',
      '/bin',
      '/var/www/.composer/vendor/bin',
      '/helpers',
    ],
    confSrc: __dirname,
    command: ['sh -c \'a2enmod rewrite && apache2-foreground\''],
    composer_version: '2.0.7',
    image: 'apache',
    defaultFiles: {
      _php: 'php.ini',
      vhosts: 'default.conf',
      // server: @TODO? DO THE PEOPLE DEMAND IT?
    },
    environment: {
      COMPOSER_ALLOW_SUPERUSER: 1,
      COMPOSER_MEMORY_LIMIT: '-1',
      PHP_MEMORY_LIMIT: '1G',
    },
    remoteFiles: {
      _php: '/usr/local/etc/php/conf.d/xxx-lando-default.ini',
      vhosts: '/etc/apache2/sites-enabled/000-default.conf',
      php: '/usr/local/etc/php/conf.d/zzz-lando-my-custom.ini',
    },
    sources: [],
    ssl: false,
    via: 'apache',
    volumes: ['/usr/local/bin'],
    webroot: '.',
  },
  parent: '_appserver',
  builder: (parent, config) => class LandoPhp extends parent {
    constructor(id, options = {}, factory) {
      options = parseConfig(_.merge({}, config, options));
      // Mount our default php config
      options.volumes.push(`${options.confDest}/${options.defaultFiles._php}:${options.remoteFiles._php}`);

      // Shift on the docker entrypoint if this is a more recent version
      if (options.version !== 'custom' && semver.gt(semver.coerce(options.version), '5.5.0')) {
        options.command.unshift('docker-php-entrypoint');
      }

      // If xdebug is set to "true" then map it to "debug"
      if (options.xdebug === true) options.xdebug = 'debug';

      // Build the php
      const php = {
        image: `devwithlando/php:${options.version}-${options.image}-2`,
        environment: _.merge({}, {
          PATH: options.path.join(':'),
          LANDO_WEBROOT: `/app/${options.webroot}`,
          XDEBUG_CONFIG: xdebugConfig(options._app.env.LANDO_HOST_IP),
          XDEBUG_MODE: (options.xdebug === false) ? 'off' : options.xdebug,
        }, options.environment),
        networks: (_.startsWith(options.via, 'nginx')) ? {default: {aliases: ['fpm']}} : {default: {}},
        ports: (_.startsWith(options.via, 'apache') && options.version !== 'custom') ? ['80'] : [],
        volumes: options.volumes,
        command: options.command.join(' '),
      };
      options.info = {via: options.via};

      // Add our composer things to run step
      if (!_.isEmpty(options.composer)) {
        const commands = utils.getInstallCommands(options.composer, pkger, ['composer', 'global', 'require']);
        utils.addBuildStep(commands, options._app, options.name, 'build_internal');
      }

      // Add activate steps for xdebug
      if (options.xdebug) {
        utils.addBuildStep(['docker-php-ext-enable xdebug'], options._app, options.name, 'build_as_root_internal');
      }

      // Install the desired composer version
      if (options.composer_version) {
        const commands = [`/helpers/install-composer.sh ${options.composer_version}`];
        utils.addBuildStep(commands, options._app, options.name, 'build_internal', true);
      }

      // Add in nginx if we need to
      if (_.startsWith(options.via, 'nginx')) {
        // Set another lando service we can pass down the stream
        const nginxOpts = nginxConfig(options);
        // Merge in any user specifified
        const LandoNginx = factory.get('nginx');
        const data = new LandoNginx(nginxOpts.name, nginxOpts);
        // If the user has overriden this service lets make sure we include that as well
        const userOverrides = _.get(options, `_app.config.services.${nginxOpts.name}.overrides`, {});
        data.data.push({
          services: _.set({}, nginxOpts.name, userOverrides),
          version: _.get(data, 'data[0].version'),
        });
        // This is a trick to basically replicate what happens upstream
        options._app.add(data);
        options._app.info.push(data.info);
        // Indicate the relationship on the primary service
        options.info.served_by = nginxOpts.name;
      }

      // Add in the php service and push downstream
      options.sources.push({services: _.set({}, options.name, php)});
      super(id, options, ..._.flatten(options.sources));
    };
  },
};
