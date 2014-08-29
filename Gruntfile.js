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

    // titanium_run task tests
    titanium_run: {
      options: {
        build: {
          iosVersion: '7.1',
          buildOnly: true
        },
        quiet: true
      },

      // should use "test/fixtures/explicit/**/*" files and copy
      // them to "tmp/explicit/Resources/"
      explicit: {},

      // should use "test/fixtures/test.js" and copy it to
      // "tmp/test/Resources/app.js"
      anothertest: {
        options: {
          name: 'anothertest'
        }
      },

      // should use "files" destination and source(s)
      test: {
        files: {
          'tmp/test/Resources': ['test/fixtures/explicit/**/*.js']
        }
      }
    },

    // should use "test/app.js" and copy to "tmp/test/Resources/app.js"
    //ti_run: [ 'app' ],

    // titanium task tests
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
      titanium: ['test/titanium_test.js'],
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

  // test titanium_run
  grunt.registerTask('testl', ['env', 'titanium_run']);

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['env', 'titanium:should_create', 'titanium:should_build',
    'titanium:should_project', 'titanium:should_sdk', 'nodeunit:titanium',
    'titanium:should_clean', 'nodeunit:clean', 'clean']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
