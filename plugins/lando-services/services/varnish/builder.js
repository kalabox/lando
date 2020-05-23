'use strict';

// Modules
const _ = require('lodash');
const utils = require('./../../lib/utils');

// Helper to builder nginx command
const nginxCommand = vhost => [
  'mkdir -p /opt/bitnami/nginx/conf/vhosts',
  '&&',
  'render-template',
  `\"${vhost}\" > \"/opt/bitnami/nginx/conf/vhosts/lando.conf\"`,
  '&&',
  '/entrypoint.sh /run.sh',
].join(' ');

// Helper to get varnsh ssl nginx
const varnishSsl = options => ({
  command: nginxCommand('/opt/bitnami/extra/nginx/templates/default.conf.tpl'),
  image: 'bitnami/nginx:1.14.2',
  depends_on: [options.name],
  environment: {
    NGINX_DAEMON_USER: 'root',
    NGINX_DAEMON_GROUP: 'root',
    LANDO_VARNISH_ALIAS: `${options.name}_varnish`,
  },
  user: 'root',
  volumes: [
    `${options.confDest}/${options.defaultFiles.ssl}:/opt/bitnami/extra/nginx/templates/default.conf.tpl`,
  ],
});

// Builder
module.exports = {
  name: 'varnish',
  config: {
    version: '4.1',
    supported: ['4.1'],
    backends: ['appserver'],
    confSrc: __dirname,
    backend_port: '80',
    ssl: false,
    sslExpose: false,
    sources: [],
    defaultFiles: {
      ssl: 'ssl-termination.conf.tpl',
      chaperone: 'chaperone.conf',
    },
    remoteFiles: {
      vcl: '/etc/varnish/conf.d/lando.vcl',
    },
  },
  parent: '_lando',
  builder: (parent, config) => class LandoVarnish extends parent {
    constructor(id, options = {}, factory) {
      options = _.merge({}, config, options);
      // Arrayify the backend
      if (!_.isArray(options.backends)) options.backends = [options.backends];
      // Build the default stuff here
      const varnish = {
        image: `eeacms/varnish:${options.version}-3.0`,
        command: '/usr/local/bin/chaperone --user root --force --debug',
        depends_on: options.backends,
        environment: {
          BACKENDS: options.backends.join(' '),
          BACKENDS_PORT: options.backend_port,
          ADDRESS_PORT: ':80',
          BACKENDS_PROBE_ENABLED: 'false',
          LANDO_NO_USER_PERMS: 'NOTGONNADOIT',
          LANDO_WEBROOT_USER: 'varnish',
          LANDO_WEBROOT_GROUP: 'varnish',
          LANDO_WEBROOT_UID: '104',
          LANDO_WEBROOT_GID: '107',
        },
        networks: {default: {aliases: [`${options.name}_varnish`]}},
        ports: ['80'],
        volumes: [
          `${options.confDest}/${options.defaultFiles.chaperone}:/etc/chaperone.d/chaperone.conf`,
        ],
      };
      // Change the me user
      options.meUser = 'varnish';
      // Set some info about our backends
      options.info = {backends: options.backends};
      // Set the varnish
      options.sources.push({services: _.set({}, options.name, varnish)});

      // Spin up an nginx bomb if we need ssl termination
      if (options.ssl) {
        // Set the opts for this custom swill
        const sslOpts = _.assign(_.cloneDeep(options), {
          name: `${options.name}_ssl`,
          type: 'nginx',
          version: 'custom',
          config: `${options.confDest}/${options.defaultFiles.ssl}`,
          info: {backend: 'edge', managed: true},
          meUser: 'www-data',
          overrides: utils.cloneOverrides(options.overrides),
          ssl: true,
          sslExpose: true,
        });

        // Set another lando service we can pass down the stream
        const LandoCompose = factory.get('_lando');
        const nginx = {services: _.set({}, sslOpts.name, varnishSsl(options))};
        const data = new LandoCompose(sslOpts.name, sslOpts, nginx);
        // This is a trick to basically replicate what happens upstream
        options._app.add(data);
        options._app.info.push(data.info);
        // Indicate the relationship on the primary service
        options.info.ssl_served_by = sslOpts.name;
      }

      // Send it downstream
      super(id, options, ..._.flatten(options.sources));
    };
  },
};
