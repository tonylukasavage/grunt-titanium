/*
 * grunt-titanium
 * https://github.com/tonylukasavage/grunt-titanium
 *
 * Copyright (c) 2014 Tony Lukasavage
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');

var TEST_APP = 'grunt-titanium-app';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        'test/*_test.js',
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },
    env: {
      dev: {
        GRUNT_TITANIUM_TEST: '1'
      }
    },
    clean: {
      tests: ['tmp'],
    },

    titanium_launch: {
      options: {
        build: {
          iosVersion: '7.1',
          buildOnly: true
        }
      }
    },

    // Configuration to be run (and then tested).
    titanium: {
      should_create: {
        options: {
          command: 'create',
          name: TEST_APP,
          workspaceDir: 'tmp',
          force: true
        }
      },
      should_build: {
        options: {
          command: 'build',
          projectDir: path.join('tmp', TEST_APP),
          buildOnly: true,
          quiet: true
        }
      },
      should_project: {
        options: {
          command: 'project',
          projectDir: path.join('tmp', TEST_APP),
          output: 'json',
          args: ['sdk-version', '3.2.0.GA']
        }
      },
      should_sdk: {
        options: {
          command: 'sdk',
          args: ['select', '3.2.0.GA']
        }
      },
      should_clean: {
        options: {
          command: 'clean',
          projectDir: path.join('tmp', TEST_APP),
          quiet: true
        }
      }
    },

    // unit tests
    nodeunit: {
      main: ['test/main_test.js'],
      clean: ['test/clean_test.js']
    },

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // test titanium_launch
  grunt.registerTask('testl', ['env', 'titanium_launch:explicit']);

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['env', 'titanium:should_create', 'titanium:should_build', 'titanium:should_project',
    'titanium:should_sdk', 'nodeunit:titanium', 'titanium:should_clean', 'nodeunit:clean', 'clean']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
