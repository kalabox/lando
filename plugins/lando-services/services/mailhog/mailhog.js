'use strict';

module.exports = lando => {
  // Modules
  const _ = lando.node._;
  const addConfig = lando.utils.services.addConfig;
  const buildVolume = lando.utils.services.buildVolume;

  // "Constants"
  const scd = lando.config.servicesConfigDir;

  /*
   * Supported versions for mailhog
   */
  const versions = [
    'v1.0.0',
    'latest',
    'custom',
  ];

  /*
   * Return the networks needed
   */
  const networks = () => ({});

  /*
   * Build out mailhog
   */
  const services = (name, config) => {
    // Start a services collector
    const services = {};

    // Get the hostname
    const hostname = [name, lando.config.proxyDomain].join('.');

    // Default mailhog service
    const mailhog = {
      image: 'mailhog/mailhog:' + config.version,
      user: 'root',
      environment: {
        TERM: 'xterm',
        MH_API_BIND_ADDR: ':80',
        MH_HOSTNAME: hostname,
        MH_UI_BIND_ADDR: ':80',
      },
      ports: ['80'],
      command: 'MailHog',
      networks: {
        default: {
          aliases: ['sendmailhog'],
        },
      },
    };

    // Handle port forwarding
    if (config.portforward) {
      // If true assign a port automatically
      if (config.portforward === true) {
        mailhog.ports.push('1025');
      } else {
        mailhog.ports.push(config.portforward + ':1025');
      }
    }

    // Mailhog is weird and needs to modify other services and right now
    // this seems to be the only way to do this from here
    lando.events.on('post-instantiate-app', app => {
      // Stuff we needs
      const smtp = 'sendmailhog:1025';
      const defaultConf = '/usr/local/etc/php/conf.d';
      const defaultFile = 'zzzz-lando-mailhog.ini';
      const mailHogConf = ['mailhog', 'mailhog.ini'];
      const mhsendmail = '/usr/local/bin/mhsendmail';
      const github = 'https://github.com/mailhog/mhsendmail/releases/download/';
      const sendmail = 'v0.2.0/mhsendmail_linux_amd64';
      const smUrl = github + sendmail;
      const downloadCmd = ['curl', '-fsSL', '-o', mhsendmail, smUrl].join(' ');
      const chmodCmd = ['chmod', '+x', mhsendmail].join(' ');

      // Go through each and set up the hogfroms
      _.forEach(_.get(config, 'hogfrom', []), hog => {
        // Add in environmental constiables
        const env = _.get(app.services[hog], 'environment', {});
        env.MH_SENDMAIL_SMTP_ADDR = smtp;
        _.set(app.services[hog], 'environment', env);

        // Add our default mailhog ini
        const hogConf = _.get(app.config.services, hog, {});
        const phpConfiDir = _.get(hogConf, 'phpConfDir', defaultConf);
        const remote = phpConfiDir + '/' + defaultFile;
        const iniMount = buildVolume(mailHogConf, remote, scd);
        let volumes = _.get(app.services[hog], 'volumes', {});
        volumes = addConfig(iniMount, volumes);
        _.set(app.services[hog], 'volumes', volumes);

        // Add in mhsendmail run as root interal steps
        const rootKey = 'install_dependencies_as_root_internal';
        const rootSteps = _.get(app.config.services[hog], rootKey, []);
        rootSteps.push(downloadCmd);
        rootSteps.push(chmodCmd);
        _.set(app.config.services[hog], rootKey, rootSteps);
      });
    });

    // Put it all together
    services[name] = mailhog;

    // Return our service
    return services;
  };

  /*
   * Return the volumes needed
   */
  const volumes = () => {
    return {data: {}};
  };

  /*
   * Metadata about our service
   */
  const info = (name, config) => {
    // Add in generic info
    const info = {
      internal_connection: {
        host: name,
        port: config.port || 1025,
      },
      external_connection: {
        host: 'localhost',
        port: config.portforward || 'not forwarded',
      },
    };

    // Show the config files being used if they are custom
    if (!_.isEmpty(config.config)) {
      info.config = config.config;
    }

    // Return the collected info
    return info;
  };

  return {
    defaultVersion: 'v1.0.0',
    info: info,
    networks: networks,
    services: services,
    versions: versions,
    volumes: volumes,
    configDir: __dirname,
  };
};
