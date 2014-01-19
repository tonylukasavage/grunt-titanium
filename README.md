# grunt-titanium

> grunt plugin for titanium CLI

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

## The "titanium" task

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
Default value: `build`

The command to execute with the Titanium CLI.

#### options.args
Type: `Array`,
Default value: `[]`

All the non-flag, non-option arguments to pass to the Titanium CLI. For example, `ti sdk select 3.2.0.GA` would be created as

```javascript
grunt.initConfig({
  titanium: {
    options: {
      command: 'sdk',
      args: ['select', '3.2.0.GA']
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
    options: {
      command: 'clean',
      quiet: false
    }
  }
});
```

### Usage Examples

There's a few practical usage examples in this repo's [Gruntfile.js](Gruntfile.js), but here's a few more explained. Note that grunt-titanium will use sensible defaults for many required CLI parameters.

#### Create a project

grunt-titanium makes it trivial to add creating a Titanium project to your workflow. Extremely useful for testing. The following would create an app named `MyTestApp` in the same directory as your Gruntfile.js.

```js
grunt.initConfig({
  titanium: {
    options: {
      command: 'create',
      name: 'MyTestApp',
      workspaceDir: '.'
    }
  }
});
```

Let's say we wanted to build an app in a specific location. We could do it like this:

```js
grunt.initConfig({
  titanium: {
    options: {
      command: 'build',
      projectDir: '/path/to/project',
      platform: 'ios'
    }
  }
});

Or try out some of the Titanium CLI's other commands. grunt-titanium can do anything the CLI can do, so feel free to be inventive. Let's say we have some automated testing and we need to change the current selected Titanium SDK as part of that testing. No problem:

```js
grunt.initConfig({
  titanium: {
    options: {
      command: 'sdk',
      args: ['select', '3.2.0.GA']
    }
  }
});

Or we can tie multiple commands together. You could create temporary app for testing, run it for android and ios, then clean it afterwards:

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

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).
