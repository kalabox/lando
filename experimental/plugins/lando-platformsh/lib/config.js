'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const PlatformYaml = require('./yaml');

/*
 * Helper to get appMount
 */
const getAppMount = (app, base, files) => {
  if (_.has(app, 'source.root')) return path.join(base, app.source.root);
  return _(files)
    .filter(file => file.name === app.name)
    .thru(file => file[0].dir)
    .value();
};

/*
 * Helper to locate the "closest" platform yaml
 */
const traverseUp = (startFrom = process.cwd()) => {
  return _(_.range(path.dirname(startFrom).split(path.sep).length))
    .map(end => _.dropRight(path.dirname(startFrom).split(path.sep), end).join(path.sep))
    .unshift(startFrom)
    .dropRight()
    .value();
};

/*
 * Helper to find closest app
 */
exports.findClosestApplication = (apps = []) => _(apps)
  .filter(app => app.closeness !== -1)
  .orderBy('closeness')
  .thru(apps => apps[0])
  .value();

/*
 * Helper to load all the platform config files we can find
 */
exports.loadConfigFiles = baseDir => {
  const yamlPlatform = new PlatformYaml(baseDir);
  const routesFile = path.join(baseDir, '.platform', 'routes.yaml');
  const servicesFile = path.join(baseDir, '.platform', 'services.yaml');
  const applicationsFile = path.join(baseDir, '.platform', 'applications.yaml');
  const platformAppYamls = _(fs.readdirSync(baseDir, {withFileTypes: true}))
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .concat('.')
    .map(directory => path.resolve(baseDir, directory, '.platform.app.yaml'))
    .filter(file => fs.existsSync(file))
    .map(file => ({data: yamlPlatform.load(fs.readFileSync(file)), file}))
    .map(data => ({name: data.data.name, file: data.file, dir: path.dirname(data.file)}))
    .value() || [];

  // Load in applications from all our platform yamls
  const applications = _(platformAppYamls)
    .map(app => yamlPlatform.load(fs.readFileSync(app.file)))
    .value() || [];

  // If we also have an applications file then concat
  if (fs.existsSync(applicationsFile)) {
    applications.push(yamlPlatform.load(fs.readFileSync(applicationsFile)));
  }

  return {
    applications: _.flatten(applications),
    applicationFiles: platformAppYamls,
    routes: (fs.existsSync(routesFile)) ? yamlPlatform.load(fs.readFileSync(routesFile)) : {},
    services: (fs.existsSync(servicesFile)) ? yamlPlatform.load(fs.readFileSync(servicesFile)) : {},
  };
};

/*
 * Helper to parse the platformsh config files
 */
exports.parseApps = ({applications, applicationFiles}, appRoot) => _(applications)
  // Get the basics
  .map(app => _.merge({}, app, {
    application: true,
    appMountDir: getAppMount(app, appRoot, applicationFiles),
    closeness: _.indexOf(traverseUp(), getAppMount(app, appRoot, applicationFiles)),
    // @TODO: can we assume the 0? is this an index value?
    // @NOTE: probably not relevant until we officially support multiapp?
    hostname: `${app.name}.0`,
    sourceDir: _.has(app, 'source.root') ? path.join('/app', app.source.root) : '/app',
  }))
  // And the webPrefix
  .map(app => _.merge({}, app, {
    webPrefix: _.difference(app.appMountDir.split(path.sep), appRoot.split(path.sep)).join(path.sep),
  }))
  // Return
  .value();

/*
 * Helper to parse the platformsh config files
 */
exports.parseRelationships = (apps, open = {}) => _(apps)
  .map(app => app.relationships || [])
  .flatten()
  .thru(relationships => relationships[0])
  .map((relationship, alias) => ({
    alias,
    service: relationship.split(':')[0],
    endpoint: relationship.split(':')[1],
    creds: _.get(open, alias, {}),
  }))
  .groupBy('service')
  .value();

/*
 * Helper to parse the platformsh routes file eg replace DEFAULT in the routes.yml
 */
exports.parseRoutes = (routes, domain) => JSON.parse(JSON.stringify(routes).replace(/{default}/g, domain));

/*
 * Helper to parse the platformsh services file
 */
exports.parseServices = (services, relationships = {}) => _(services)
  .map((config, name) => _.merge({}, config, {
    aliases: _.has(relationships, name) ? _.map(relationships[name], 'alias') : [],
    application: false,
    creds: _(_.get(relationships, name, {}))
      .map('creds')
      .flatten()
      .value(),
    hostname: name,
    name,
    opener: '{"relationships": {}}',
  }))
  .value();
