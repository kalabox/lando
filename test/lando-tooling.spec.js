/**
 * Tests for the lando tooling plugin.
 * @file lando-tooling.spec.js
 */

'use strict';

const originalArgv = process.argv;
const Cli = require('./../lib/cli');
const landoToolingUtils = require('./../plugins/lando-tooling/lib/utils');
const chai = require('chai');
chai.should();

const setInitialArgv = function(argv) {
  Object.defineProperty(process, 'argv', {value: argv});
  // Emulate a Lando node CLI.
  process.lando = 'node';
};
const resetArgv = function() {
  Object.defineProperty(process, 'argv', {value: originalArgv});
  delete process.lando;
};

const fakeTask = {
  command: 'task',
  describe: 'desc',
  run: options => options,
};

describe('lando-tooling', () => {
  describe('#lando-tooling-utils', () => {
    it('should pass options delimiter to backend', () => {
      setInitialArgv(['node', 'lando.js', 'task', '--', '-vvv']);
      const cli = new Cli();
      const task = cli.parseToYargs(fakeTask);
      task.handler = argv => argv; // Use a noop handler.
      const args = cli.run([task]);
      let config = landoToolingUtils.parseConfig(['task'], 'simple-service', {}, args);
      config.should.have.lengthOf(1);
      let configEntry = config[0];
      configEntry.command.should.deep.equal(['task', '--', '-vvv']);
      configEntry.args.should.deep.equal(['--', '-vvv']);
      resetArgv();
    });

    it('should ignore initial options delimiter', () => {
      setInitialArgv(['node', 'lando.js', '--', 'task', '--', '-vvv']);
      const cli = new Cli();
      const task = cli.parseToYargs(fakeTask);
      task.handler = argv => argv; // Use a noop handler.
      const args = cli.run([task]);
      let config = landoToolingUtils.parseConfig(['task'], 'simple-service-2', {}, args);
      config.should.have.lengthOf(1);
      let configEntry = config[0];
      configEntry.command.should.deep.equal(['task', '--', '-vvv']);
      configEntry.args.should.deep.equal(['--', '-vvv']);
      resetArgv();
    });
  });
});
