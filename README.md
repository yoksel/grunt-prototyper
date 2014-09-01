# grunt-prototyper

> Create elements from components

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-prototyper --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-prototyper');
```

## The "prototyper" task

### Overview
In your project's Gruntfile, add a section named `prototyper` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  prototyper: {
            default_options: {
                options: {
                    openResult: false
                },
                cwd: "myfiles/",
                componentsFolder: "components/",
                templatesFolder: "templates/",
                includesFolder: "includes/",
                config: "config.json"
            }
        }
});
```

To see how it works run `grunt` in package folder and/or look into folder `test/`.

## Release History

0.0.7 - Add ability to add custom class to main template element (using {{{aditional-classes}}}).

0.0.6 - Add ability to add wrapper with custom class for element.

0.0.5 - Add embeded template for demo output.

0.0.4 - Add components to the demo page.

