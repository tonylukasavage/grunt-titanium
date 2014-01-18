'use strict';

var grunt = require('grunt'),
  path = require('path');

var TEST_APP = 'grunt-titanium-app',
  appPath = path.resolve('tmp', TEST_APP);

exports.titanium = {
  setUp: function(done) {
    grunt.file.mkdir(path.resolve('tmp'));
    done();
  },
  should_create: function(test) {
    test.expect(3);

    test.ok(grunt.file.exists(path.join(appPath, 'tiapp.xml')));
    test.ok(grunt.file.exists(path.join(appPath, 'Resources')));
    test.ok(grunt.file.exists(path.join(appPath, 'Resources', 'app.js')));

    test.done();
  },
  should_build: function(test) {
    test.expect(4);

    test.ok(grunt.file.exists(path.join(appPath, 'build')));
    if (process.platform === 'darwin') {
      test.ok(grunt.file.exists(path.join(appPath, 'build', 'iphone')));
      test.ok(grunt.file.exists(path.join(appPath, 'build', 'iphone', TEST_APP + '.xcodeproj')));
      test.ok(grunt.file.exists(path.join(appPath, 'build', 'iphone', 'build', TEST_APP + '.build')));
    } else {
      test.ok(grunt.file.exists(path.join(appPath, 'build', 'android')));
      test.ok(grunt.file.exists(path.join(appPath, 'build', 'android', 'bin')));
      test.ok(grunt.file.exists(path.join(appPath, 'build', 'android', 'bin', TEST_APP + '.apk')));
    }

    test.done();
  }
};
