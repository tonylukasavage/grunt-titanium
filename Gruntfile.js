/*
 * grunt-titanium
 * https://github.com/tonylukasavage/grunt-titanium
 *
 * Copyright (c) 2014 Tony Lukasavage
 * Licensed under the MIT license.
 */

'use strict';

var exec = require('child_process').exec,
  path = require('path');

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
      }

    },

    // should use "test/app.js" and copy to "tmp/test/Resources/app.js"
    ti_run: {

      options: {
        build: {
          buildOnly: true
        },
        quiet: true
      },

      // should use "files" destination and source(s)
      test: {
        files: {
          'tmp/test': ['test/fixtures/explicit/*']
        }
      },

      // test/app.js
      app: {},

      onemore: {
        files: {
          'tmp/onemore/Resources': ['test/titanium*', 'Gruntfile.js', 'package.json', 'fixtures/anothertest.js']
        }
      },

      testSuccess: {
        options: {
          build: {
            buildOnly: false
          },
          success: function(data) {
            return (/SUCCESS/).test(data);
          }
        },
        files: {
          'tmp/testSuccess/Resources': ['test/app.js']
        }
      },

      testSuccessRegex: {
        options: {
          build: {
            buildOnly: false
          },
          success: /SUCCESS/
        },
        files: {
          'tmp/testSuccessRegex/Resources': ['test/app.js']
        }
      },

      testSuccessString: {
        options: {
          build: {
            buildOnly: false
          },
          success: 'SUCCESS'
        },
        files: {
          'tmp/testSuccessString/Resources': ['test/app.js']
        }
      },

      testFailure: {
        options: {
          build: {
            buildOnly: false
          },
          failure: function(data) {
            return (/FAILED/).test(data);
          }
        },
        files: {
          'tmp/testFailure/Resources': ['test/fixtures/bad/app.js']
        }
      },

      testFailureRegex: {
        options: {
          build: {
            buildOnly: false
          },
          failure: /FAILED/
        },
        files: {
          'tmp/testFailureRegex/Resources': ['test/fixtures/bad/app.js']
        }
      },

      testFailureString: {
        options: {
          build: {
            buildOnly: false
          },
          failure: 'FAILED'
        },
        files: {
          'tmp/testFailureString/Resources': ['test/fixtures/bad/app.js']
        }
      }

    },

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
      should_clean: {
        options: {
          command: 'clean',
          projectDir: path.join('tmp', TEST_APP),
          quiet: true
        }
      },
      should_version_local: {
        options: {
          command: 'help',
          version: true
        }
      },
      should_version_global: {
        options: {
          command: 'help',
          version: true,
          preferGlobal: true
        }
      }
    },

    // shorthand
    ti: {
      should_config: {
        options: {
          command: 'config',
          args: ['grunt.titanium', 1]
        }
      }
    },

    // unit tests
    nodeunit: {
      titanium: ['test/titanium_test.js'],
      titanium_run: ['test/titanium_run_test.js'],
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

  grunt.registerTask('ti-version', function(type) {
    var done = this.async(), tiBin;

    if (type === 'local') {
      tiBin = path.join('node_modules', '.bin', 'ti');
    } else if (type === 'global') {
      tiBin = 'ti';
    } else {
      grunt.fail.fatal('ti-version type must be "local" or "global"');
    }

    exec('"' + tiBin + '" --version', function(err, stdout, stderr) {
      if (err) { return done(err); }
      var merge = { env: { dev: {} } },
        key = 'TI_VERSION_' + type.toUpperCase(),
        version = stdout.trim();

      merge.env.dev[key] = version;
      grunt.config.merge(merge);
      grunt.log.writeln(key + ' = ' + version);
      return done();
    });
  });

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'ti-version:local', 'ti-version:global',
    'env', 'titanium:should_create', 'titanium:should_build', 'titanium:should_project',
    'ti:should_config', 'titanium:should_version_local', 'titanium:should_version_global',
    'nodeunit:titanium', 'titanium:should_clean', 'titanium_run', 'ti_run',
    'nodeunit:titanium_run', 'nodeunit:clean', 'clean']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
