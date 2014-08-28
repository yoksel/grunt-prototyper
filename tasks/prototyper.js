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
    open = require("open"),
    prototyper = require("./lib/prototyper.js");

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
            parsedResults = {},
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

        var folderPaths = [elementsPath, blocksPath, modulePath];


        // 1. PARSE FOLDERS FIRST
        // ------------------------------------------
        // fill parsedData and parsedTemplates

        prototyper.parseFolders(folderPaths);

        // console.log(" \n\n- - prototyper.parsedData - - ");
        // console.log(prototyper.parsedData);
        // console.log(" \n\n- - prototyper.parsedTemplates - - ");
        // console.log(prototyper.parsedTemplates);

        // 2. FILL PARSED RESULTS (only element at first)
        // ------------------------------------------
        prototyper.fillTemplatesWithData(prototyper.parsedTemplates, prototyper.parsedData);


        // console.log(" \n\n- - prototyper.parsedResults - - ");
        // console.log(prototyper.parsedResults);



        // 3. Parse all set from elements to modules
        // ------------------------------------------
        var paramsBlocks = {
            "templatesKey": "blocks",
            "parsResultKey": "elements"
        };
        prototyper.fillTemplatesByKey(paramsBlocks);

        console.log(" \n\n- - prototyper.parsedResults BLOCKS - - ");
        console.log(prototyper.parsedResults.blocks);

        var paramsModules = {
            "templatesKey": "modules",
            "parsResultKey": "blocks"
        };
        prototyper.fillTemplatesByKey(paramsModules);

        // console.log(" \n\n- - prototyper.parsedResults - - ");
        // console.log(prototyper.parsedResults.modules);

        // console.log("- - templatesComponents - - ");
        // console.log(templatesComponents);

        // console.log("\n - - parsedTemplates - - ");
        // console.log(parsedTemplates);

        // console.log("\n - - parsedData - - ");
        // console.log(parsedData);


        // PAINT ADDITIONAL TEMPLATES
        // ------------------------------------------


        // 4. Try to remap
        // ------------------------------------------

        // var newPropset = {
        //     "elements": prototyper.parsedResults.elements,
        // };


        var newElements = {
                    "comments": "123",
                    "title": "2342342"
            };

        var paramsBlocks2 = {
            "templatesKey": "blocks",
            "parsResultKey": "elements",
            "myParsedResults": {
                "elements": newElements
            }
        };
        prototyper.fillTemplatesByKey(paramsBlocks2);

        var paramsModules2 = {
            "templatesKey": "modules",
            "parsResultKey": "blocks",
            "modification": "_newName"
        };
        prototyper.fillTemplatesByKey(paramsModules2);

        console.log(" \n\n- - prototyper.parsedResults (modules) - - ");
        console.log(prototyper.parsedResults.modules);

        // PAINT RESULT
        // ------------------------------------------

        var finalModules = prototyper.parsedResults.modules;


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

        /**
        * Fill parsedResults
        */


        //************************************ TRASHCAN

        /**
        * Fill parsedResults
        */

        function fillTemplatesWithData(templatesSet, dataSet){
            for(var dataGroupKey in dataSet){
                var dataGroup = dataSet[dataGroupKey];
                var templatesGroup = templatesSet[dataGroupKey];

                for (var dataItemKey in dataGroup){
                    var dataItem = dataGroup[dataItemKey];
                    var templateItem = templatesGroup[dataItemKey];

                    if (!dataItem.toString()){
                        continue;
                    }
                    var parsedContent = mustache.render(templateItem, dataItem);

                    if (!parsedResults[dataGroupKey]){
                        parsedResults[dataGroupKey] = {};
                    }
                    parsedResults[dataGroupKey][dataItemKey] = parsedContent;
                }
            }
        }

                function remapObject(inputObject, map) {
            var newObj = {};

            map.forEach(function(itemKey) {
                newObj[itemKey] = inputObject[itemKey];
            });

            // console.log("\n\n - - newObj - - -");
            // console.log(newObj);
            return newObj;
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