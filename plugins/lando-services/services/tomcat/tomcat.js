'use strict';

module.exports = lando => {
  // Modules
  const _ = lando.node._;
  const addConfig = lando.utils.services.addConfig;
  const addScript = lando.utils.services.addScript;
  const buildVolume = lando.utils.services.buildVolume;

  // "Constants"
  const scd = lando.config.servicesConfigDir;
  const esd = lando.config.engineScriptsDir;

  /*
   * Supported versions for tomcat (many more available, look at the supported
   * tags list on Docker Hub: https://hub.docker.com/r/library/tomcat/)
   */
  const versions = [
    '7',
    '8',
    'latest',
    'custom',
  ];

  /*
   * Return the networks needed
   */
  const networks = () => ({});

  /*
   * Build out tomcat
   */
  const services = (name, config) => {
    // Start a services collector
    const services = {};

    // Define config mappings
    const configFiles = {
      serverxmlfile: '/usr/local/tomcat/conf/server.xml',
      tomcatusersfile: '/usr/local/tomcat/conf/tomcat-users.xml',
      contextfile: '/usr/local/tomcat/conf/context.xml',
      managercontext: '/usr/local/tomcat/webapps/manager/META-INF/context.xml',
      contextfragspath: '/usr/local/tomcat/conf/Catalina/localhost',
      webroot: config._mount,
    };

    // Add the webroot if its there
    if (_.has(config, 'webroot')) {
      configFiles.webroot = configFiles.webroot + '/' + config.webroot;
    }

    // Default tomcat service
    const tomcat = {
      image: 'tomcat:' + config.version,
      ports: ['80'],
      environment: {
        TERM: 'xterm',
        LANDO_WEBROOT: configFiles.webroot,
      },
      volumes: [],
      command: 'catalina.sh run',
    };

    // Set the default server.xml conf file
    const serverXml = ['tomcat', 'server.xml'];
    let confVol = buildVolume(serverXml, configFiles.serverxmlfile, scd);

    // Set the default tomcat-users.xml conf file
    const tomcatUsersXml = ['tomcat', 'tomcat-users.xml'];
    confVol = buildVolume(tomcatUsersXml, configFiles.tomcatusersfile, scd);

    // Set the default context.xml conf file
    const contextXml = ['tomcat', 'context.xml'];
    confVol = buildVolume(contextXml, configFiles.contextfile, scd);

    // Set the default manager context.xml conf file to allow access to the host
    const managerContextXml = ['tomcat', 'manager-context.xml'];
    confVol = buildVolume(managerContextXml, configFiles.managercontext, scd);

    // Set the context fragments path to allow defining and controlling new
    // Tomcat webapp contexts
    const contextFragments = ['tomcat', 'contextFragments'];
    confVol = buildVolume(contextFragments, configFiles.contextfragspath, scd);

    // write the configs out
    tomcat.volumes = addConfig(confVol, tomcat.volumes);

    // Handle ssl option
    if (config.ssl) {
      // Add the SSL port
      tomcat.ports.push('443');

      // If we don't have a custom default ssl config lets use the default one
      const sslConf = ['tomcat', 'httpd-ssl.conf'];
      const sslVolume = buildVolume(sslConf, configFiles.serverxmlfile, scd);
      tomcat.volumes = addConfig(sslVolume, tomcat.volumes);

      // Inject add-cert so we can get certs before our app starts
      tomcat.volumes = addScript('add-cert.sh', tomcat.volumes, esd, 'scripts');
    }

    // Handle custom config files
    _.forEach(configFiles, function(file, type) {
      if (_.has(config, 'config.' + type)) {
        const local = config.config[type];
        const customConfig = buildVolume(local, file, '$LANDO_APP_ROOT_BIND');
        tomcat.volumes = addConfig(customConfig, tomcat.volumes);
      }
    });

    // Put it all together
    services[name] = tomcat;

    // Return our service
    return services;
  };

  /*
   * Metadata about our service
   */
  const info = (name, config) => {
    // Start up an info collector
    const info = {};
    // Add the webroot
    info.webroot = _.get(config, 'webroot', '.');
    // Show the config files being used if they are custom
    if (!_.isEmpty(config.config)) info.config = config.config;
    // Return the collected info
    return info;
  };

  /*
   * Return the volumes needed
   */
  const volumes = function() {
    return {data: {}};
  };

  return {
    defaultVersion: '8',
    info: info,
    networks: networks,
    services: services,
    versions: versions,
    volumes: volumes,
    configDir: __dirname,
  };
};
