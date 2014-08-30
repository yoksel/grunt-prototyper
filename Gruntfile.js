/*
 * grunt-prototyper
 * https://github.com/yoksel/grunt-prototyper
 *
 * Copyright (c) 2014 yoksel
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt);

    // Project configuration.
    grunt.initConfig({
        jshint: {
            all: [
                'Gruntfile.js',
                'tasks/*.js',
                "test/**.*js"
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },

        clean: {
            tests: ['tmp']
        },

        prototyper: {
            dev: {
                options: {
                    openResult: false
                },
                cwd: "test/",
                componentsFolder: "components/",
                templatesFolder: "templates/",
                includesFolder: "includes/",
                config: "config.json"
            },
            test: {
                options: {},
                cwd: "test/",
                componentsFolder: "components/",
                templatesFolder: "templates/",
                includesFolder: "includes/",
                config: "config.json"
            }
        },

        watch: {
            all: {
                files: [
                    'test/**/*',
                    '!test/index.html',
                ],
                tasks: ['prototyper:dev', 'jshint'],
                options: {
                    reload: true,
                    livereload: 1337, //true,
                },
            }
        },

        connect: {
            server: {
                options: {
                    port: 9002,
                    open: {
                        target: 'http://localhost:9002/test/'
                    }
                }
            }
        }

    });

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

    grunt.registerTask('default', ['prototyper:test', 'jshint']);

    grunt.registerTask('dev', [
        'connect:server:open',
        'watch'
    ]);

};