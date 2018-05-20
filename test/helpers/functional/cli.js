'use strict';

const CliTest = require('command-line-test');
const fs = require('fs');
const path = require('path');
const pathToLando = path.resolve('bin', 'lando.js');
const jsYaml = require('js-yaml');
const os = require('os');

/**
 * Class containing static methods to help with running tests
 */
class CliHelper {

  /**
   * Execute a Lando Command using the entrypoint in codebase
   * @param {array} args - arguments/options to pass to Lando
   * @param {object} options - options to pass to execFile
   * @return {Promise} - A promise chain containing output of
   *                     command execution
   */
  static execCommand(args, options) {
    const cliTest = new CliTest();
    return cliTest.execFile(pathToLando, args, options);
  }

  /**
   * Create a Lando file to setup a test.
   * @param {object} app - Representation of Lando file
   * @return {Promise} A promise chain containing the folder
   */
  static createTestApp(app) {
    // Create temp folder to store app
    const appFolder = fs.mkdtempSync(
      path.join(os.tmpdir(), 'lando-php-test-'),
      (err, folder) => {
        if (err) { throw err; }
        return folder;
      }
    );

    // Write the app definition to the folder
    fs.writeFileSync(
      `${appFolder}${path.sep}.lando.yml`,
      jsYaml.dump(app),
      'utf8',
      err => { if (err) { throw err; } }
    );

    return new Promise((resolve, reject) => {
      resolve(appFolder);
    });
  }
}

module.exports = CliHelper;
