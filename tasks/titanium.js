/*
 * grunt-titanium
 * https://github.com/tonylukasavage/grunt-titanium
 *
 * Copyright (c) 2014 Tony Lukasavage
 * Licensed under the MIT license.
 */

'use strict';

var _ = require('lodash'),
	async = require('async'),
	child_process = require('child_process'),
	exec = child_process.exec,
	fs = require('fs-extra'),
	path = require('path'),
	readdir = require('recursive-readdir'),
	spawn = child_process.spawn;

// global flags for titanium cli
var GLOBAL_FLAGS = {
	noBanner: true,
	noProgressBars: true,
	noPrompt: true,
	args: []
};

// extend fs-extra a bit
['File','Directory'].forEach(function(type) {
	var func = 'is' + type;
	fs[func] = function(o) {
		try {
			return fs.statSync(o)[func]();
		} catch (e) {
			return false;
		}
	};
});

module.exports = function(grunt) {

	var descr = 'grunt plugin to create and launch an Appcelerator Titanium app';
	grunt.registerMultiTask('titanium_run', descr, executeTitaniumRun);
	grunt.registerMultiTask('ti_run', descr, executeTitaniumRun);

	descr = 'grunt plugin for appc titanium CLI';
	grunt.registerMultiTask('titanium', descr, executeTitanium);
	grunt.registerMultiTask('ti', descr, executeTitanium);

	function executeTitaniumRun() {

		// the task just an array of targets?
		if (_.isString(this.data)) {
			this.target = this.data;
			this.files = [];
		}

		// set opts for create and build
		var self = this,
			done = this.async(),
			opts = this.options({
				build: {},
				create: {},
				dir: 'tmp',
				force: true,
				logLevel: 'info',
				name: this.target,
				quiet: false
			}),
			createOpts = _.extend({
				name: opts.name,
				id: opts.id || 'grunttitanium.' + opts.name,
				platforms: 'android,blackberry,ios,ipad,iphone,mobileweb',
				workspaceDir: path.resolve(opts.dir),
				force: opts.force,
				quiet: true,
				noBanner: true,
				noProgressBars: true,
				noPrompt: true
			}, opts.create),
			buildOpts = _.extend({
				logLevel: opts.logLevel,
				platform: process.platform === 'darwin' ? 'ios' : 'android',
				projectDir: path.resolve(opts.dir, createOpts.name),
				quiet: opts.quiet,
				noBanner: true,
				noProgressBars: true,
				noPrompt: true
			}, opts.build);

		// ensure login, create app, build/run app
		async.series([
			ensureLogin,
			function(callback) { return execCommand('create', createOpts, callback); },
			function(callback) {

				var dest = path.resolve(buildOpts.projectDir, 'Resources'),
					appJs = path.resolve(dest, 'app.js'),
					locations = [
						path.resolve('test', 'fixtures', opts.name),
						path.resolve('test', 'fixtures', opts.name + '.js'),
						path.resolve('test', opts.name),
						path.resolve('test', opts.name + '.js'),
						path.resolve(opts.name),
						path.resolve(opts.name + '.js')
					];


				// if there's no self.files, let's try some default locations
				if (!self.files || !self.files.length) {
					for (var i = 0; i < locations.length; i++) {
						var loc = locations[i],
							fileTest = !!(i%2);

						if (fileTest && fs.isFile(loc)) {
							fs.copySync(loc, appJs);
							return callback();
						} else if (!fileTest && fs.isDirectory(loc)) {
							return copyToApp(loc, path.join(dest, '..'), callback);
						}
					}
					grunt.fail.warn('no files for titanium_run:' + self.target);
				}

				// copy all from "files" to destination
				else {
					self.files.forEach(function(fileObj) {
						var dest = fileObj.dest || dest;
						fileObj.src.forEach(function(file) {
							fs.copySync(file, path.resolve(dest, path.basename(file)));
						});
					});
				}

				return callback();

			},
			function(callback) {
				buildOpts.success = opts.success;
				buildOpts.failure = opts.failure;
				return execCommand('build', buildOpts, callback);
			}
		], done);

	}

	function executeTitanium() {

		var command = this.options().command || 'build',
			done = this.async(),
			extraArgs = [],
			options;

		// set default options based on command
		switch (command) {
			case 'build':
				options = this.options(_.extend({
					logLevel: 'info',
					platform: process.platform === 'darwin' ? 'ios' : 'android',
					projectDir: '.'
				}, GLOBAL_FLAGS));
				break;
			case 'create':
				options = this.options(_.extend({
					name: 'tmp',
					id: 'com.grunttitanium.tmp',
					workspaceDir: '.',
					platforms: 'android,blackberry,ios,ipad,iphone,mobileweb',
					quiet: true
				}, GLOBAL_FLAGS));

				// make sure options.platforms is a string
				if (_.isArray(options.platforms)) {
					options.platforms = options.platforms.join(',');
				}
				break;
			default:
				options = this.options(GLOBAL_FLAGS);
				break;
		}

		// ensure login and execute the command
		async.series([
			ensureLogin,
			function(callback) {
				return execCommand(command, options, callback);
			}
		], function(err, result) {
			return done(err);
		});

	}

	// execute titanium commands
	function execCommand(command, options, callback) {
		var args = [],
			extraArgs = (options.args || []).slice(0),
			preferGlobal = options.preferGlobal || false,
			srcSuccess = options.success,
			srcFailure = options.failure,
			success, failure;

		// remove processed options
		delete options.args;
		delete options.command;
		delete options.failure;
		delete options.preferGlobal;
		delete options.success;

		// must have output to satisfy success/failure conditions
		if (srcSuccess || srcFailure) {
			delete options.quiet;
		}

		// determine succes and failure types
		if (_.isRegExp(srcSuccess)) {
			success = function(data) { return srcSuccess.test(data); };
		} else if (_.isString(srcSuccess)) {
			success = function(data) { return data.toString().indexOf(srcSuccess) !== -1; };
		} else if (_.isFunction(srcSuccess)) {
			success = srcSuccess;
		} else if (!!success) {
			success = undefined;
			grunt.fail.warn('invalid type for success option, must be string, regexp, or function');
		}

		if (_.isRegExp(srcFailure)) {
			failure = function(data) { return srcFailure.test(data); };
		} else if (_.isString(srcFailure)) {
			failure = function(data) { return data.toString().indexOf(srcFailure) !== -1; };
		} else if (_.isFunction(srcFailure)) {
			failure = srcFailure;
		} else if (!!failure) {
			failure = undefined;
			grunt.fail.warn('invalid type for failure option, must be string, regexp, or function');
		}

		// create the list of command arguments
		Object.keys(options).forEach(function(key) {
			var value = options[key],
				isBool = _.isBoolean(value);
			if (!isBool || (isBool && !!value)) {
				args.push(camelCaseToDash(key));
			}
			if (!isBool) { args.push(value); }
		});
		args.unshift(command);

		// add non-option, non-flag arguments
		args = args.concat(extraArgs);

		// spawn command and output
		grunt.log.writeln('appc ti ' + args.join(' '));
		var tiOpts = process.env.GRUNT_TITANIUM_TEST || success || failure ?
				{} : {stdio: 'inherit'},
			ti = spawn(getTitaniumPath(preferGlobal), args, tiOpts);

		// prepare functions for killing this process
		function killer(data) {
			grunt.log.write(data);
			if (ti.killed) {
				return;
			} else if (success && success(data)) {
				ti.kill();
				grunt.log.ok('appc ti run successful');
			} else if (failure && failure(data)) {
				ti.kill();
				grunt.fail.warn('appc ti run failed');
			}
		}

		// listen for success or failure conditions
		if (success || failure) {
			ti.stdout.on('data', killer);
			ti.stderr.on('data', killer);
		}

		// handle titanium's exit
		ti.on('close', function(code) {
			if (command !== 'build' || options.buildOnly) {
				if (code) {
					grunt.fail.fatal('titanium ' + command + ' failed.');
				} else {
					grunt.log.ok('titanium ' + command + ' complete.');
				}
			}
			return callback(ti.killed ? null : code);
		});

		// write output to a file for analysis in test specs
		if (process.env.GRUNT_TITANIUM_TEST) {
			var testFile = path.resolve('tmp', preferGlobal ? 'tmp_global.txt' : 'tmp.txt');
			grunt.file.mkdir(path.dirname(testFile));
			fs.writeFileSync(testFile, '');
			ti.stdout.on('data', function(data) {
				fs.appendFileSync(testFile, data);
			});
		}
	}

	// ensure appc user is logged in
	function ensureLogin(callback) {
		exec('"' + getTitaniumPath() + '" status -o json', function(err, stdout, stderr) {
			if (err) { return callback(err); }
			if (!JSON.parse(stdout).loggedIn) {
				grunt.fail.fatal([
					'You must be logged in to use grunt-titanium. Use `appc login`.'
				]);
			}
			return callback();
		});
	}

};

function getTitaniumPath(preferGlobal) {
	if (preferGlobal) {
		return 'titanium';
	} else {
		return process.env.GRUNT_TITANIUM_TEST ?
			path.resolve('node_modules', '.bin', 'titanium') :
			path.resolve('node_modules', 'grunt-titanium', 'node_modules', '.bin', 'titanium');
	}
}

function copyToApp(src, dest, callback) {
	readdir(src, function(err, files) {
		if (err) { return callback(err); }
		files.forEach(function(file) {
			fs.copySync(file, path.resolve(dest, path.relative(src, file)));
		});
		return callback();
	});
}

function camelCaseToDash(str) {
	if (typeof str !== 'string') { return str; }
	return '--' + str.replace(/([A-Z])/g, function(m) { return '-' + m.toLowerCase(); });
}
