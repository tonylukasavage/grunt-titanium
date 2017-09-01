> **WARNING** This repo is no longer maintained. Appcelerator (at some point) removed "titanium login" from their CLI, which is integral to grunt-titanium working. I believe someone noted this was around version 5 of Titanium, but I'm not certain. In any case, grunt-titanium is only really reliable prior to Titanium 5.0.

# grunt-titanium [![NPM version](https://badge.fury.io/js/grunt-titanium.png)](http://badge.fury.io/js/grunt-titanium) [![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

grunt plugin for titanium CLI

## Getting Started
This plugin requires Grunt `~0.4.2`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-titanium --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-titanium');
```

## Prerequisites

grunt-titanium sits on top of your [Titanium SDK](http://www.appcelerator.com/titanium/) installation. It won't install the SDK for you. It won't install Android, iOS, etc... for you. Be sure your Titanium environment is setup before trying to use this plugin as part of your development workflow.

## The "titanium" or "ti" task

### Overview
In your project's Gruntfile, add a section named `titanium` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  titanium: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
});
```

### Options

#### options.command
Type: `String`
Default value: `'build'`

The command to execute with the Titanium CLI.

#### options.preferGlobal
Type: `Boolean`
Default value: `false`

If set to `true`, grunt-titanium will use your globally installed version of titanium to execute the commands. If `false` (default), it will use the version of titanium included with grunt-titanium's dependencies.

#### options.args
Type: `Array`,
Default value: `[]`

All the non-flag, non-option arguments to pass to the Titanium CLI. For example, `ti sdk select 3.2.0.GA` would be created as

```javascript
grunt.initConfig({
  titanium: {
    all: {
      options: {
        command: 'sdk',
        args: ['select', '3.2.0.GA']
      }
    }
  }
});
```

#### options...

The rest of the options and flags are the same as the those available to the Titanium CLI. You can see this list like this by typing `titanium help COMMAND_NAME`. The options should be named as camel case as opposed to the dashed format used by the CLI, making them easier to use as keys in your options. For example, `--build-only` becomes `buildOnly`. More details in the examples below.

#### flags

Flags like `--quiet` should be given a boolean value.

```js
grunt.initConfig({
  titanium: {
    all: {
      options: {
        command: 'clean',
        quiet: false
      }
    }
  }
});
```

## The "titanium_run" or "ti_run" task

This task will quickly create a Titanium app, add project files to it, then run it.

### Options

#### options.build
Type: `Object`
Default value: `{}`

An object full options to be passed to the `titanium build` command. This option list is identical to how you would pass options in the titanium task.

#### options.create
Type: `Object`
Default value: `{}`

An object full options to be passed to the `titanium create` command. This option list is identical to how you would pass options in the titanium task.

#### options.dir
Type: `String`
Default value: `tmp`

The directory in which to store the created project.

#### options.failure
Type: `String|RegExp|Function`
Default: `undefined`

Based on the output of the Titanium app, determine if it has _failed_. This is necessary if you want a `run` or `ti_run` task to finish, since Titanium runs indefinitely if there's no intervention or error. Useful for [chaining commands](#chaining-commands) together.

Here's the details on each possible usage, where `data` represents each line of output from Titanium. If the `condition` is `true`, the task is considered to have failed.

type | condition | example
-----|--------------|--------
String | `data.indexOf(String) !== -1` | `{ failure: 'I failed' }`
RegExp | `RegExp.test(data)` | `{ faillure: /(?:failed|errored)/i }`
Function | `Function(data)` | `{ failure: function(data) { return data.charAt(0) === '!' } }`

Check the [Gruntfile.js](https://github.com/tonylukasavage/grunt-titanium/blob/master/Gruntfile.js) for more examples of success and failure conditions.

#### options.name
Type: `String`

The name of the project to create. If not specified, the name of the grunt target will be used.

#### option.quiet
Type: `Boolean`
Default value: `false`

Set to true if you want to make both the create and build process quiet.

#### options.success
Type: `String|RegExp|Function`
Default: `undefined`

Based on the output of the Titanium app, determine if it has _succeeded_. This is necessary if you want a `run` or `ti_run` task to finish, since Titanium runs indefinitely if there's no intervention or error. Useful for [chaining commands](#chaining-commands) together.

Here's the details on each possible usage, where `data` represents each line of output from Titanium. If the `condition` is `true`, the task is considered to have succeeded.

type | condition | example
-----|--------------|--------
String | `data.indexOf(String) !== -1` | `{ success: 'SUCCESS' }`
RegExp | `RegExp.test(data)` | `{ success: /(?:success|done)/i }`
Function | `Function(data)` | `{ success: function(data) { return data.charAt(0) === '!' } }`

Check the [Gruntfile.js](https://github.com/tonylukasavage/grunt-titanium/blob/master/Gruntfile.js) for more examples of success and failure conditions.

### Usage Examples

There's a few practical usage examples in this repo's [Gruntfile.js](Gruntfile.js). Also, [ti-mocha's Gruntfile.js](https://github.com/tonylukasavage/ti-mocha/blob/master/Gruntfile.js) uses grunt-titanium to automate the launching of runtime testing. Aside from that, here's a few more examples. Note that grunt-titanium will use sensible defaults for many required CLI parameters.

#### Create, add files, and run a project

Before getting into the individual command you can run with the `titanium` task, let's look at the most common use case with `titanium_run`. Here we will create a new titanium app, add files to it using grunt's file capabilities, then build the app.

```js
grunt.initConfig({
  ti_run: {
    options: {
      build: {
        platform: 'ios'
      }
    },
    myapp: {
      files: {
        'tmp/myapp': ['test/fixtures/myapp/**/*']
      }
    }
  }
});
```

But the `ti-run` task tries to make a lot of smart decisions for you, so the above could also be defined as tersely as this:

```js
grunt.initConfig({
  ti_run: {
    myapp: {}
  }
});
```

or even more tersely:

```js
grunt.initConfig({
  ti_run: ['myapp']
});
```

For details on the multiple default locations that `ti_run` will check for files, please read [issue #12](https://github.com/tonylukasavage/grunt-titanium/issues/12). Using these locations will make your Gruntfile.js much cleaner.

#### Create a project

grunt-titanium makes it trivial to add creating a Titanium project to your workflow. Extremely useful for testing. The following would create an app named `MyTestApp` in the same directory as your Gruntfile.js.

```js
grunt.initConfig({
  titanium: {
    all: {
      options: {
        command: 'create',
        name: 'MyTestApp',
        workspaceDir: '.'
      }
    }
  }
});
```

#### Build a project

Let's say we wanted to build an app in a specific location. We could do it like this:

```js
grunt.initConfig({
  titanium: {
    all: {
      options: {
        command: 'build',
        projectDir: '/path/to/project',
        platform: 'ios'
      }
    }
  }
});
```

#### Execute arbitrary Titanium CLI commands

Try out some of the Titanium CLI's other commands. grunt-titanium can do anything the CLI can do, so feel free to be inventive. Let's say we have some automated testing and we need to change the current selected Titanium SDK as part of that testing. No problem:

```js
grunt.initConfig({
  titanium: {
    all: {
      options: {
        command: 'sdk',
        args: ['select', '3.2.0.GA']
      }
    }
  }
});
```

#### Chaining commands

We can tie multiple commands together. You could create temporary app for testing, run it for android and ios, then clean it afterwards:

```js
var APP_NAME = 'MyTestApp';
grunt.initConfig({
  titanium: {
    create: {
      options: {
        command: 'create',
        name: APP_NAME,
        workspaceDir: '.'
      }
    },
    build_ios: {
      options: {
        command: 'build',
        projectDir: './' + APP_NAME,
        platform: 'ios',
        buildOnly: true
      }
    },
    build_android: {
      options: {
        command: 'build',
        projectDir: './' + APP_NAME,
        platform: 'android'
        buildOnly: true
      }
    },
    clean: {
      options: {
        command: 'clean',
        projectDir: './' + APP_NAME
      }
    }
  }
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Testing

```
grunt --force
```

In order to properly test this repo, you must use the `--force` flag with `grunt` since we need to test a failing task condition. This means that the message:

> Done, but with warnings.

at the end means everything worked. The warnings are expected and are part of the testing suite.
