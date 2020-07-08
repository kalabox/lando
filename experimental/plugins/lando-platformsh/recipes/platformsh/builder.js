'use strict';

// Modules
const _ = require('lodash');
const {getLandoServices} = require('./../../lib/services');
const {getLandoProxyRoutes} = require('./../../lib/proxy');
const {getPlatformPull} = require('./../../lib/pull');
const {getPlatformPush} = require('./../../lib/push');
const tooling = require('./../../lib/tooling');

/*
 * Build Platformsh
 */
module.exports = {
  name: 'platformsh',
  parent: '_recipe',
  config: {
    confSrc: __dirname,
    proxy: {},
    services: {},
    tooling: {},
  },
  builder: (parent, config) => class LandoPlatformsh extends parent {
    constructor(id, options = {}) {
      // Get our options
      options = _.merge({}, config, options);
      // Get the platformConfig weve loaded and parsed
      const platformConfig = _.get(options, '_app.platformsh', {});
      // Combine application and service containers
      const services = _.flatten([platformConfig.applications, platformConfig.services]);

      // Map into lando services
      options.services = getLandoServices(services, platformConfig.runConfig);
      // Map into lando proxy routes
      options.proxy = getLandoProxyRoutes(platformConfig.routes, _.map(services, 'name'));

      // Get the service version of our closest application
      const closestApp = _.find(options.services, service => {
        return service.name === platformConfig.closestApp.name;
      });

      // Get the app tooling
      const applicationTooling = tooling.getAppTooling(closestApp);
      // Get relatable services
      const openData = options._app._lando.cache.get(`${options._app.name}.${closestApp.name}.open.cache`);
      const relatableServices = tooling.getRelatableServices(openData);
      const serviceContainers = _(options.services)
        .filter(service => _.includes(relatableServices, service.name))
        .map(service => service)
        .value();
      const serviceTooling = tooling.getServiceTooling(serviceContainers, openData, closestApp.name);

      // Merge and set the lando tooling
      options.tooling = _.merge({}, applicationTooling, serviceTooling);

      // Add in the pull scripts
      options.tooling.pull = getPlatformPull(closestApp.name, options._app);

      // Add in relationship envvars
      options.tooling.pull.env = _(serviceTooling)
        // Get connect strings and merge with any env set by the command eg PG_PASS
        .map((data, name) => ([
          [
            [_.toUpper(`LANDO_CONNECT_${name}`), data.connect],
            [_.toUpper(`LANDO_CONNECT_${name}_DEFAULT_SCHEMA`), data.default],
          ],
          _.toPairs(data.env),
        ]))
        // Level it all off and convert back to object
        .flatten()
        .flatten()
        .fromPairs()
        .value();

      // Add in the pull scripts
      options.tooling.push = getPlatformPush(closestApp.name, options._app);
      // Add in relationship envvars
      options.tooling.push.env = _(serviceTooling)
        // Get connect strings and merge with any env set by the command eg PG_PASS
        .map((data, name) => ([
          [
            [_.toUpper(`LANDO_DUMP_${name}`), data.dump],
            [_.toUpper(`LANDO_CONNECT_${name}_DEFAULT_SCHEMA`), data.default],
          ],
          _.toPairs(data.env),
        ]))
        // Level it all off and convert back to object
        .flatten()
        .flatten()
        .fromPairs()
        .value();

      // Send downstream
      super(id, options);
    };
  },
};
