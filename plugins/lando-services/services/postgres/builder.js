'use strict';

// Modules
const _ = require('lodash');

/*
 * Apache for all
 */
module.exports = {
  name: 'postgres',
  config: {
    version: '10',
    supported: ['12', '11', '11.1', '11.0', '10', '10.6.0', '9.6'],
    pinPairs: {
      '12': 'bitnami/postgresql:12.2.0-debian-10-r57',
      '11': 'bitnami/postgresql:11.7.0-debian-10-r34',
      '10': 'bitnami/postgresql:10.12.0-debian-10-r36',
      '9.6': 'bitnami/postgresql:9.6.17-debian-10-r37',
    },
    patchesSupported: true,
    confSrc: __dirname,
    creds: {
      database: 'database',
    },
    healthcheck: 'psql -U postgres -c "\\\l"',
    port: '5432',
    defaultFiles: {
      database: 'postgresql.conf',
    },
    remoteFiles: {
      database: '/bitnami/postgresql/conf/conf.d/lando.conf',
    },
  },
  parent: '_service',
  builder: (parent, config) => class LandoPostgres extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      const postgres = {
        image: `bitnami/postgresql:${options.version}`,
        command: '/launch.sh',
        environment: {
          ALLOW_EMPTY_PASSWORD: 'yes',
          POSTGRESQL_DATABASE: options.creds.database,
          POSTGRES_DB: options.creds.database,
          LANDO_NEEDS_EXEC: 'DOEEET',
        },
        volumes: [
          `${options.confDest}/launch.sh:/launch.sh`,
          `${options.confDest}/${options.defaultFiles.database}:${options.remoteFiles.database}`,
          `${options.data}:/bitnami/postgresql`,
        ],
      };
      // The Bitnami Postgres container is particular about the user/pass.
      options.creds.user = 'postgres';
      options.creds.password = '';
      // Send it downstream
      super(id, options, {services: _.set({}, options.name, postgres)});
    };
  },
};
