'use strict';

var grunt = require('grunt'),
  path = require('path');

exports.titanium = {
  setUp: function(done) {
    grunt.file.mkdir(path.resolve('tmp'));
    done();
  },
  should_create: function(test) {
    test.expect(3);

    var project = path.resolve('tmp', 'should_create');
    test.ok(grunt.file.exists(path.join(project, 'tiapp.xml')));
    test.ok(grunt.file.exists(path.join(project, 'Resources')));
    test.ok(grunt.file.exists(path.join(project, 'Resources', 'app.js')));

    test.done();
  }
};
