'use strict';

var exec = require('child_process').exec,
  fs = require('fs'),
  grunt = require('grunt'),
  path = require('path');

var TEST_APP = 'grunt-titanium-app',
  appPath = path.resolve('tmp', TEST_APP);

exports.titanium = {

  explicit: function(test) {
    test.expect(6);

    var root = path.resolve('tmp', 'explicit'),
      resources = path.join(root, 'Resources');

    test.ok(grunt.file.exists(path.join(resources, 'app.js')));
    test.ok(grunt.file.exists(path.join(resources, 'foo')));
    test.ok(grunt.file.exists(path.join(resources, 'foo', 'bar.js')));
    test.ok(grunt.file.exists(path.join(root, 'build', 'iphone')));
    test.ok(grunt.file.exists(path.join(root, 'build', 'iphone', 'explicit.xcodeproj')));
    test.ok(grunt.file.exists(path.join(root, 'build', 'iphone', 'build', 'explicit.build')));

    test.done();
  },
  anothertest: function(test) {
    test.expect(5);

    var src = path.resolve('test', 'fixtures', 'anothertest.js'),
      root = path.resolve('tmp', 'anothertest'),
      appJs = path.resolve(root, 'Resources', 'app.js');

    test.ok(grunt.file.exists(appJs));
    test.ok(fs.readFileSync(appJs, 'utf8') === fs.readFileSync(src, 'utf8'));
    test.ok(grunt.file.exists(path.join(root, 'build', 'iphone')));
    test.ok(grunt.file.exists(path.join(root, 'build', 'iphone', 'anothertest.xcodeproj')));
    test.ok(grunt.file.exists(path.join(root, 'build', 'iphone', 'build', 'anothertest.build')));

    test.done();
  },
  app: function(test) {
    test.expect(5);

    var src = path.resolve('test', 'app.js'),
      root = path.resolve('tmp', 'app'),
      appJs = path.resolve(root, 'Resources', 'app.js');

    test.ok(grunt.file.exists(appJs));
    test.ok(fs.readFileSync(appJs, 'utf8') === fs.readFileSync(src, 'utf8'));
    test.ok(grunt.file.exists(path.join(root, 'build', 'iphone')));
    test.ok(grunt.file.exists(path.join(root, 'build', 'iphone', 'app.xcodeproj')));
    test.ok(grunt.file.exists(path.join(root, 'build', 'iphone', 'build', 'app.build')));

    test.done();
  },
  test: function(test) {
    test.expect(6);

    var root = path.resolve('tmp', 'test'),
      resources = path.join(root, 'Resources');

    test.ok(grunt.file.exists(path.join(resources, 'app.js')));
    test.ok(grunt.file.exists(path.join(resources, 'foo')));
    test.ok(grunt.file.exists(path.join(resources, 'foo', 'bar.js')));
    test.ok(grunt.file.exists(path.join(root, 'build', 'iphone')));
    test.ok(grunt.file.exists(path.join(root, 'build', 'iphone', 'test.xcodeproj')));
    test.ok(grunt.file.exists(path.join(root, 'build', 'iphone', 'build', 'test.build')));

    test.done();
  },
  onemore: function(test) {
    test.expect(8);

    var root = path.resolve('tmp', 'onemore'),
      resources = path.join(root, 'Resources');

    test.ok(grunt.file.exists(path.join(resources, 'app.js')));
    test.ok(grunt.file.exists(path.join(resources, 'Gruntfile.js')));
    test.ok(grunt.file.exists(path.join(resources, 'package.json')));
    test.ok(grunt.file.exists(path.join(resources, 'titanium_run_test.js')));
    test.ok(grunt.file.exists(path.join(resources, 'titanium_test.js')));
    test.ok(grunt.file.exists(path.join(root, 'build', 'iphone')));
    test.ok(grunt.file.exists(path.join(root, 'build', 'iphone', 'onemore.xcodeproj')));
    test.ok(grunt.file.exists(path.join(root, 'build', 'iphone', 'build', 'onemore.build')));

    test.done();
  }
};
