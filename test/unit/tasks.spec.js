/**
 * Tests for tasks module.
 * @file tasks.spec.js
 */

'use strict';

const chai = require('chai');
chai.should();
const expect = chai.expect;

const tasks = require('./../../lib/tasks');

const elScorcho = {
  command: 'elscorcho [appname]',
  describe: 'Don red hair and say that [appname] shreds the cello',
  options: {
    jello: {
      describe: 'Makes [appname] jello, baby',
      alias: ['j'],
      default: false,
      boolean: true,
      interactive: {
        type: 'confirm',
        message: 'Are you sure you are jello?'
      }
    }
  },
  run: function(options) {
    console.log(options);
  }
};

describe('tasks', () => {
  describe('#add', () =>  {
    it('Adds tasks to tasks collection', () => {
      tasks.add('El Scorcho', elScorcho);
      tasks.tasks[0].should.have.property('name', 'El Scorcho');
    });
    it('Rejects tasks that lack the minimum defined keys', () => {
      const badTask = () => {
        tasks.add('How You Remind Me', {describe: 'Terrible'});
      };
      expect(badTask).to.throw();
    });
  });
});
