/*
 * grunt-prototyper
 * https://github.com/yoksel/grunt-prototyper
 *
 * Copyright (c) 2014 yoksel
 * Licensed under the MIT license.
 */

'use strict';

var mustache = require("mustache"),
    path = require("path");

module.exports = function(grunt) {

    grunt.registerMultiTask('prototyper', 'Create elements from components', function() {
        // Merge task-specific and/or target-specific options with these defaults.
        var components = this.data.components,
            templates = this.data.templates,
            elementsPath = components + "elements/",
            blocksPath = components + "blocks/",
            modulePath = components + "modules/";

        var folderPaths = [elementsPath, blocksPath, modulePath];

        var templatesComponents = {};

        folderPaths.forEach(function(folderPath) {
            var folderName = path.basename(folderPath);
            // console.log("folderPath: " + folderName);

            var subFolders = grunt.file.expand(folderPath + "*");

            // subFolders.forEach(function(subFolderPath) {
            templatesComponents[folderName] = parseFolder(folderPath);
            // });

        });

        console.log("-----*-------");
        console.log(templatesComponents);
        console.log("------------");

        var componentsSources = grunt.file.expand(components + "*");
        var elementsList = {};

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
                } else if (srcFolderName === "blocks") {
                    itemJson = templatesComponents["elements"];
                } else if (srcFolderName === "modules") {
                    itemJson = templatesComponents["blocks"];
                }

                console.log(" - - itemJson - - ");
                console.log(itemJson);
                // console.log(itemTemplate);

                if (itemJson) {
                    var output = mustache.render(itemTemplate, itemJson);
                    folderData[srcFolderName] = output;
                }

            });

            console.log("folderData");
            console.log(folderData);
            console.log("------------");

            return folderData;
        }

        // console.log(elementsSources);



        // console.log(elementsList);


        console.log("------------");


    });

};