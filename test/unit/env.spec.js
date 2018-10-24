/**
 * Tests for .env loading.
 * @file env.spec.js
 */

'use strict';

const chai = require('chai');
const fs = require('fs');
const path = require('path');
const os = require('os');
const CliTest = require('command-line-test');
chai.should();

const paths = {
  processDir: process.cwd(),
  projectDirectory: path.join(__dirname, '..', '..'),
  envAppDir: path.join(__dirname, '..', '..', 'examples', 'envfile'),
  envAppSubDir: path.join(__dirname, '..', '..', 'examples', 'envfile', 'subdir-test'),
  landoFile: path.join(__dirname, '..', '..', 'bin', 'lando.js'),
};

describe('.env', () => {
  const cli = new CliTest();
  const errorMessage = 'Trouble parsing .env';

  // Ensure Lando environment "envfile" exists
  before(() => {
    const initEnvironmentCmd = [
      `cd ${paths.envAppDir}`,
      `node ${paths.landoFile} list`,
    ];

    return cli.exec(initEnvironmentCmd.join(' && '))
      .then(res => {
        return res.stdout.should.not.contain(errorMessage);
      });
  });

  it('should load when working directory is in app.root', done => {
    const testCmd = [
      `cd ${paths.envAppDir}`,
      `node ${paths.landoFile} info`,
    ];

    cli.exec(testCmd.join(' && '))
      .then(res => {
        res.stdout.should.not.contain(errorMessage);
        done();
      })
      .catch(error => done(error));
  });

  it('should load when working directory is outside of app root', done => {
    const testCmd = [
      `cd ${os.tmpDir}`,
      `node ${paths.landoFile} info envfile`,
    ];

    cli.exec(testCmd.join(' && '))
      .then(res => {
        res.stdout.should.not.contain(errorMessage);
        done();
      })
      .catch(error => done(error));
  });

  it('should load .env when cwd is a subdirectory of app.root', done => {
    if (!fs.existsSync(paths.envAppSubDir)) {
      fs.mkdirSync(paths.envAppSubDir);
    }

    const testCmd = [
      `cd ${paths.envAppSubDir}`,
      `node ${paths.landoFile} info`,
    ];

    cli.exec(testCmd.join(' && '))
      .then(res => {
        fs.rmdirSync(paths.envAppSubDir);
        res.stdout.should.not.contain(errorMessage);
        done();
      })
      .catch(error => done(error));
  });


  // Ensure Lando environment "envfile" is destroyed
  after(function() {
    // Allow up to ten seconds for environment to be destroyed
    // eslint-disable-next-line no-invalid-this
    this.timeout(10000);

    const initEnvironmentCmd = [
      `cd ${paths.envAppDir}`,
      `node ${paths.landoFile} destroy envfile -y`,
    ];

    return cli.exec(initEnvironmentCmd.join(' && '))
      .then(res => {
        return res.stdout.should.not.contain(errorMessage);
      }).catch(error => console.log(error));
  });
});
