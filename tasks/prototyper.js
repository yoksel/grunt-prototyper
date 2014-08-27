/*
 * grunt-prototyper
 * https://github.com/yoksel/grunt-prototyper
 *
 * Copyright (c) 2014 yoksel
 * Licensed under the MIT license.
 */

'use strict';

var mustache = require("mustache"),
    path = require("path"),
    open = require("open");

module.exports = function(grunt) {

    grunt.registerMultiTask('prototyper', 'Create elements from components', function() {
        // Merge task-specific and/or target-specific options with these defaults.
        var cwd = this.data.cwd,
            componentsFolder = this.data.componentsFolder,
            templates = cwd + this.data.templatesFolder,
            elementsPath = cwd + componentsFolder + "elements/",
            blocksPath = cwd + componentsFolder + "blocks/",
            modulePath = cwd + componentsFolder + "modules/",
            resultFile = cwd + "index.html";

        var folderPaths = [elementsPath, blocksPath, modulePath];

        var templatesComponents = {};

        folderPaths.forEach(function(folderPath) {
            var folderName = path.basename(folderPath);
            var subFolders = grunt.file.expand(folderPath + "*");
            templatesComponents[folderName] = parseFolder(folderPath);
        });

        var finalModules = templatesComponents.modules;
        var finalData = {
            "templates": []
        };

        if (finalModules) {
            for (var item in finalModules) {
                finalData.templates.push({
                    "name": item,
                    "content": finalModules[item]
                });
            }
        }

        var indexTemplate = grunt.file.read(templates + "index.html");

        var result = mustache.render(indexTemplate, finalData);

        grunt.file.write(resultFile, result);
        open(resultFile);


        // FUNCTIONS
        // ----------------------------------------------

        function parseFolder(folderPath) {
            var folderName = path.basename(folderPath);
            var sources = grunt.file.expand(folderPath + "*");

            var folderData = {};

            sources.forEach(function(sourceFolderPath) {
                var srcFolderName = path.basename(sourceFolderPath);

                var itemTemplate = grunt.file.read(sourceFolderPath + "/template.html");
                var jsonPath = sourceFolderPath + "/data.json";

                var itemJson = {};

                if (grunt.file.exists(jsonPath)) {
                    itemJson = grunt.file.readJSON(jsonPath);
                } else if (folderName === "blocks") {
                    itemJson = templatesComponents["elements"];
                } else if (folderName === "modules") {
                    itemJson = templatesComponents["blocks"];
                }

                if (itemJson) {
                    var output = mustache.render(itemTemplate, itemJson);
                    folderData[srcFolderName] = output;
                }

            });

            return folderData;
        }

    });

};