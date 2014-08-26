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

        // console.log("-----*-------");
        // console.log(templatesComponents);
        // console.log("------------");

        var finalModules = templatesComponents.modules;
        var finalData = {
            "templates": []
        };

        if (finalModules) {
            for (var item in finalModules) {
                console.log("-----" + item + "------");
                console.log(finalModules[item]);
                finalData.templates.push({
                    "name": item,
                    "content": finalModules[item]
                });
            }
        }

        var indexTemplate = grunt.file.read(templates + "index.html");

        var result = mustache.render(indexTemplate, finalData);

        console.log(result);

        grunt.file.write("index.html", result);


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
                    // console.log(" \n - - JSON exist  - - ");
                    itemJson = grunt.file.readJSON(jsonPath);
                } else if (folderName === "blocks") {
                    itemJson = templatesComponents["elements"];
                    // console.log(" \n - - itemJson for BLOCKS - - ");
                    // console.log(itemJson);
                } else if (folderName === "modules") {
                    // console.log("\n - - itemJson for MODULES - - ");
                    // console.log(itemJson);
                    itemJson = templatesComponents["blocks"];
                }

                // console.log(" - - itemJson - - ");
                // console.log(itemJson);
                // console.log(itemTemplate);

                if (itemJson) {
                    var output = mustache.render(itemTemplate, itemJson);
                    folderData[srcFolderName] = output;
                }

            });

            // console.log("folderData");
            // console.log(folderData);
            // console.log("------------");

            return folderData;
        }

        // console.log(elementsSources);



        // console.log(elementsList);


        console.log("------------");


    });

};