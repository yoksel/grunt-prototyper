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
            templatesFolder = cwd + this.data.templatesFolder,
            configFile = cwd + this.data.config,
            config = {},
            parsedTemplates = {},
            parsedData = {},
            elementsPath = cwd + componentsFolder + "elements/",
            blocksPath = cwd + componentsFolder + "blocks/",
            modulePath = cwd + componentsFolder + "modules/",
            resultFile = cwd + "index.html";

        var finalData = {
            "templates": []
        };

        if (grunt.file.exists(configFile)) {
            config = grunt.file.readJSON(configFile);
        }

        console.log(" - - config - -");
        console.log(config);

        var folderPaths = [elementsPath, blocksPath, modulePath];

        var templatesComponents = {};

        // PARSE FOLDERS
        // ------------------------------------------
        folderPaths.forEach(function(folderPath) {
            var folderName = path.basename(folderPath);
            var subFolders = grunt.file.expand(folderPath + "*");
            templatesComponents[folderName] = parseFolder(folderPath);
        });

        // console.log("- - templatesComponents - - ");
        // console.log(templatesComponents);

        console.log(" - - parsedTemplates - - ");
        console.log(parsedTemplates);


        // PAINT ADDITIONAL TEMPLATES
        // ------------------------------------------

        for (var configItem in config) {
            console.log(" - CONFIGITEM - ");
            console.log(configItem);
            var requestedElemsList = config[configItem];
            var existedElementsList = parsedData["elements"];
            var remappedElements = remapObject(existedElementsList, requestedElemsList);

            // console.log("\n - - remappedElements - - ");
            // console.log(remappedElements);

            var newDataSet = {
                "elements": {
                    "comments": "123",
                    "title": "2342342"
                },
                "blocks": parsedData.blocks,
                "modules": parsedData.modules
            };

            var renderedTemplate = parseDataByTemplates(parsedTemplates, newDataSet);

            console.log(" \n- - NEW renderedTemplate - - ");
            console.log(renderedTemplate);

            finalData.templates.push({
                "name": configItem,
                "content": renderedTemplate
            });
        }

        // var renderedTemplate = parseDataByTemplates(parsedTemplates, parsedData);

        // console.log(" \n- - renderedTemplate - - ");
        // console.log(renderedTemplate);
        // PAINT RESULT
        // ------------------------------------------

        var finalModules = templatesComponents.modules;


        if (finalModules) {
            for (var item in finalModules) {
                finalData.templates.push({
                    "name": item,
                    "content": finalModules[item]
                });
            }
        }

        var indexTemplate = grunt.file.read(templatesFolder + "index.html");

        var result = mustache.render(indexTemplate, finalData);

        grunt.file.write(resultFile, result);
        open(resultFile);


        // FUNCTIONS
        // ----------------------------------------------

        function remapObject(inputObject, map) {
            var newObj = {};

            map.forEach(function(itemKey) {
                newObj[itemKey] = inputObject[itemKey];
            });

            console.log("\n\n - - newObj - - -");
            console.log(newObj);
            return newObj;
        }

        function parseFolder(folderPath) {
            var folderName = path.basename(folderPath);
            var sources = grunt.file.expand(folderPath + "*");

            var folderData = {};

            sources.forEach(function(sourceFolderPath) {
                var srcFolderName = path.basename(sourceFolderPath);

                var itemTemplate = grunt.file.read(sourceFolderPath + "/template.html");
                if (!parsedTemplates[folderName]) {
                    parsedTemplates[folderName] = {};
                    parsedData[folderName] = {};
                }

                var jsonPath = sourceFolderPath + "/data.json";

                var itemJson = {};

                if (grunt.file.exists(jsonPath)) {
                    itemJson = grunt.file.readJSON(jsonPath);
                } else if (folderName === "blocks") {
                    itemJson = templatesComponents["elements"];
                } else if (folderName === "modules") {
                    itemJson = templatesComponents["blocks"];
                }

                parsedTemplates[folderName][srcFolderName] = itemTemplate;
                parsedData[folderName][srcFolderName] = itemJson;

                if (itemJson) {
                    var output = mustache.render(itemTemplate, itemJson);
                    folderData[srcFolderName] = output;
                }

            });

            return folderData;
        }

        function parseDataByTemplates(templatesSet, dataSet) {
            // console.log("\n\n TEMPLATES");
            // console.log(templates);

            // console.log("\n\n DATASet");
            // console.log(dataSet);
            var output = "";

            for (var keyTs in templatesSet) {
                var templates = templatesSet[keyTs];
                var datas = dataSet[keyTs];
                for (var key in templates) {
                    var template = templates[key];
                    var data = datas[key];
                    if (data) {
                        output = mustache.render(template, data);
                        // folderData[srcFolderName] = output;

                        // console.log("RENDERED");
                        // console.log(output);
                    }
                    // console.log("------------------------");
                }
            }
            return output;
        }


    });

};