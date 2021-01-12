'use strict';

// Modules
const _ = require('lodash');
const {Octokit} = require('@octokit/rest');
const semver = require('semver');

module.exports = class UpdateManager {
  /*
   * Constructor
   */
  constructor() {
    this.githubApi = new Octokit();
  };

  // noinspection JSMethodCanBeStatic
  /**
   * Compares two versions and determines if an update is available or not
   *
   * @since 3.0.0
   * @alias lando.updates.updateAvailable
   * @param {String} version1 The current version.
   * @param {String} version2 The potential update version
   * @return {Boolean} Whether an update is avaiable.
   * @example
   * // Does our current version need to be updated?
   * const updateAvailable = lando.updates.updateAvailable('1.0.0', '1.0.1');
   */
  updateAvailable(version1, version2) {
    return semver.lt(version1, version2);
  };

  // noinspection JSMethodCanBeStatic
  /**
   * Determines whether we need to fetch updatest or not
   *
   * @since 3.0.0
   * @alias lando.updates.fetch
   * @param {Object} data Cached update data
   * @return {Boolean} Whether we need to ping GitHub for new data or not
   */
  fetch(data) {
    // Return true immediately if update is undefined
    if (!data) return true;
    // Else return based on the expiration
    return !(data.expires >= Math.floor(Date.now()));
  };

  /**
   * Get latest version info from github
   *
   * @since 3.0.0
   * @alias lando.updates.refresh
   * @param {String} version Lando version to use as a fallback
   * @param {Boolean} edge Whether to check for edge releases or not
   * @return {Object} Update data
   */
  refresh(version, edge = false) {
    // GitHub repo config
    const landoRepoConfig = {
      owner: 'lando',
      repo: 'lando',
      page: 1,
      per_page: 25,
    };
    // Helper to parse data
    const parseData = (latest, version) => ({
      version: _.trimStart(_.get(latest, 'tag_name', version), 'v'),
      url: _.get(latest, 'html_url', ''),
      expires: Math.floor(Date.now()) + 86400000,
    });
    // This i promise you
    return this.githubApi.repos.listReleases(landoRepoConfig)
    // Extract and return the metadata
    .then(data => {
      // Get the latest non-draft/non-prerelease version
      const latest = _.find(_.get(data, 'data', []), r => (r.draft === false && r.prerelease === edge));
      // Return the update data
      return parseData(latest, version);
    })
    // Don't let an error here kill things
    .catch(() => parseData(null, version));
  };
};
