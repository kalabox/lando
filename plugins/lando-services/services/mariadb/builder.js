'use strict';

// Modules
const _ = require('lodash');

// Builder
module.exports = {
  name: 'mariadb',
  config: {
    version: '10.3',
    supported: ['10.4', '10.3', '10.2', '10.1'],
    pinPairs: {
      '10.4': 'bitnami/mariadb:10.4.12-debian-10-r48',
      '10.3': 'bitnami/mariadb:10.3.22-debian-10-r52',
      '10.2': 'bitnami/mariadb:10.2.31-debian-10-r47',
      '10.1': 'bitnami/mariadb:10.1.44-debian-10-r48',
    },
    patchesSupported: true,
    confSrc: __dirname,
    creds: {
      database: 'database',
      password: 'mariadb',
      user: 'mariadb',
    },
    healthcheck: 'mysql -uroot --silent --execute "SHOW DATABASES;"',
    port: '3306',
    defaultFiles: {
      database: 'my_custom.cnf',
    },
    remoteFiles: {
      database: '/opt/bitnami/mariadb/conf/my_custom.cnf',
    },
  },
  parent: '_service',
  builder: (parent, config) => class LandoMariaDb extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      const mariadb = {
        image: `bitnami/mariadb:${options.version}`,
        command: '/launch.sh',
        environment: {
          ALLOW_EMPTY_PASSWORD: 'yes',
          // MARIADB_EXTRA_FLAGS for things like coallation?
          MARIADB_DATABASE: options.creds.database,
          MYSQL_DATABASE: options.creds.database,
          MARIADB_PASSWORD: options.creds.password,
          MARIADB_USER: options.creds.user,
          LANDO_NEEDS_EXEC: 'DOEEET',
        },
        volumes: [
          `${options.confDest}/launch.sh:/launch.sh`,
          `${options.confDest}/${options.defaultFiles.database}:${options.remoteFiles.database}`,
          `${options.data}:/bitnami/mariadb`,
        ],
      };
      // Send it downstream
      super(id, options, {services: _.set({}, options.name, mariadb)});
    };
  },
};
