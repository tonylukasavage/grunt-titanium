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
	spawn = child_process.spawn;

var GLOBAL_FLAGS = {
	noBanner: true,
	noProgressBars: true,
	noPrompt: true,
	args: []
};

module.exports = function(grunt) {

	grunt.registerMultiTask('titanium_launch', 'grunt plugin to create and launch a Titanium app', function() {

		// throw new Error('titanium_launch not yet implemented');

		// set opts for create and build
		var self = this,
			done = this.async(),
			opts = this.options({
				dir: 'tmp',
				force: true,
				logLevel: 'info',
				name: this.target,
				quiet: false
			}),
			createOpts = {
				name: opts.name,
				id: opts.id || 'grunttitanium.' + opts.name,
				platforms: 'android,blackberry,ios,ipad,iphone,mobileweb',
				workspaceDir: path.resolve(opts.dir),
				force: opts.force,
				quiet: true,
				noBanner: true,
				noProgressBars: true,
				noPrompt: true
			},
			buildOpts = {
				logLevel: opts.logLevel,
				platform: process.platform === 'darwin' ? 'ios' : 'android',
				projectDir: path.resolve(opts.dir, createOpts.name),
				quiet: opts.quiet,
				noBanner: true,
				noProgressBars: true,
				noPrompt: true,
				iosVersion: '7.1'
			};

		// ensure login, create app, build/run app
		async.series([
			ensureLogin,
			function(callback) { return execCommand('create', createOpts, callback); },
			function(callback) {

				console.log(self.filesSrc);
				console.log(self.files);

				// copy all from "files" to destination
				self.files.forEach(function(fileObj) {
					var base = path.dirname(fileObj.orig.src),
						match = base.match(/^([^\*]+)/),
						relPath = match ? match[1] : '.',
						dest = fileObj.dest || path.join(buildOpts.projectDir, 'Resources');

					fileObj.src.forEach(function(file) {
						fs.copySync(file, path.join(dest, path.relative(relPath, file)));
					});
				});

				return callback();

			},
			function(callback) { return execCommand('build', buildOpts, callback); }
		], done);

	});

	grunt.registerMultiTask('titanium', 'grunt plugin for titanium CLI', function() {

		var command = this.options().command || 'build',
			done = this.async(),
			extraArgs = [],
			options;

		// remove command from options
		grunt.option('command', undefined);

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

	});

	// execute titanium commands
	function execCommand(command, options, callback) {
		var args = [],
			extraArgs = (options.args || []).slice(0);

		// remove processed options
		delete options.args;

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
		grunt.log.writeln('titanium ' + args.join(' '));
		var ti = spawn(getTitaniumPath(), args);
		ti.stdout.on('data', function(data) {
			process.stdout.write(data);
		});
		ti.stderr.on('data', function(data) {
			process.stdout.write(data);
		});
		ti.on('close', function(code) {
			if (command !== 'build' || options.buildOnly) {
				grunt.log[code ? 'error' : 'ok']('titanium ' + command + ' ' + (code ? 'failed' : 'complete') + '.');
			}
			return callback(code);
		});
	}

	// ensure appc user is logged in
	function ensureLogin(callback) {
		exec(getTitaniumPath() + ' status -o json', function(err, stdout, stderr) {
			if (err) { return callback(err); }
			if (!JSON.parse(stdout).loggedIn) {
				grunt.fail.fatal([
					'You must be logged in to use grunt-titanium. Use `titanium login`.'
				]);
			}
			return callback();
		});
	}

};

var TITANIUM;
function getTitaniumPath() {
	return TITANIUM || (process.env.GRUNT_TITANIUM_TEST ? path.resolve('node_modules', '.bin', 'titanium') :
		path.resolve('node_modules', 'grunt-titanium', 'node_modules', '.bin', 'titanium'));
}

function camelCaseToDash(str) {
	if (typeof str !== 'string') { return str; }
	return '--' + str.replace(/([A-Z])/g, function(m) { return '-' + m.toLowerCase(); });
}
