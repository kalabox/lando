'use strict';

// Modules
const _ = require('lodash');

/*
 * Helper to build mysql command strings
 */
const buildMysqlString = (cmd, {username, service, password = null} = {}) => {
  if (password) return `${cmd} -u${username} -h${service} -p${password}`;
  else return `${cmd} -u${username} -h${service}`;
};

/*
 * Helper to get php related tooling commands
 */
const getMemcachedTooling = (services, app = 'app') => _(services)
  .map(service => ({
    name: service.relationship,
    description: `Connects to the ${service.relationship} relationship`,
    cmd: `netcat ${service.service} ${service.port}`,
    service: app,
    level: 'app',
  }))
  .value();

/*
 * Helper to get php related tooling commands
 */
const getMySqlTooling = services => _(services)
  .map(service => ({
    name: service.relationship,
    description: `Connects to the ${service.relationship} relationship`,
    cmd: buildMysqlString('mysql', service),
    connect: `${buildMysqlString('mysql', service)}`,
    dump: `${buildMysqlString('mysqldump', service)}`,
    default: service.path,
    service: service.service,
    level: 'app',
  }))
  .value();

/*
 * Helper to get php related tooling commands
 */
const getsPostgresTooling = services => _(services)
  .map(service => ({
    name: service.relationship,
    description: `Connects to the ${service.relationship} relationship`,
    cmd: `psql -U${service.username} -h${service.service}`,
    connect: `psql -U${service.username} -h${service.service}`,
    dump: `pg_dump -U${service.username} -h${service.service}`,
    default: 'main',
    env: {PGPASSWORD: service.password},
    service: service.service,
    level: 'app',
  }))
  .value();

/*
 * Helper to get php related tooling commands
 */
const getRedisTooling = services => _(services)
  .map(service => ({
    name: service.relationship,
    description: `Connects to the ${service.relationship} relationship`,
    cmd: 'redis-cli',
    service: service.service,
    level: 'app',
  }))
  .value();

/*
 * Helper to get php related tooling commands
 */
const getPhpTooling = (service = 'app') => ({
  composer: {service},
  php: {service},
  psysh: {service},
});

/*
 * Helper to map lagoon type data to a lando service
 */
const getAppToolingByType = app => {
  switch (app.platformsh.type) {
    case 'php': return getPhpTooling(app.name);
    default: return {};
  };
};

/*
 * Helper to map lagoon type data to a lando service
 */
const getServiceToolingByType = ({type, services} = {}, app = 'app') => {
  switch (type) {
    case 'mariadb': return getMySqlTooling(services);
    case 'memcached': return getMemcachedTooling(services, app);
    case 'mysql': return getMySqlTooling(services);
    case 'postgresql': return getsPostgresTooling(services);
    case 'redis': return getRedisTooling(services);
    case 'redis-persistent': return getRedisTooling(services);
    default: return {};
  };
};

/*
 * Maps parsed platform config into related Lando things
 */
exports.getAppTooling = app => _.merge({}, {platform: {service: app.name}}, getAppToolingByType(app));

/*
 * Helper to get relatable services eg services for which the closest app has a relationship
 */
exports.getRelatableServices = (relationships = {}) => _(relationships)
  .map(relationship => relationship)
  .flatten()
  .map('service')
  .uniqBy()
  .value();

/*
 * Maps parsed platform config into related Lando things
 */
exports.getServiceTooling = (services, relationships, app = 'app') => {
  // Group the relationships by the service
  const parsedRelationships = _(relationships)
    .map((relationship, name) => _.merge({}, relationship[0], {relationship: name}))
    .groupBy('service')
    .value();
  // Groups the services by the service type
  const parsedServices = _(services)
    .groupBy('platformsh.type')
    .map((service, type) => _.merge({}, {type}, {
      services: _.flatten(_.map(service, s => parsedRelationships[s.name])),
    }))
    .value();

  // Build the tooling array
  return _(parsedServices)
    .map(service => getServiceToolingByType(service, app))
    .flatten()
    .filter(service => service.name)
    .map(service => ([service.name, _.omit(service, 'name')]))
    .fromPairs()
    .value();
};
