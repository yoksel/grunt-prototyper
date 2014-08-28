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
            parsedResult = {},
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

        // console.log(" - - config - -");
        // console.log(config);

        var folderPaths = [elementsPath, blocksPath, modulePath];

        var templatesComponents = {};

        // prototyper.test();

        // 1. PARSE FOLDERS FIRST
        // ------------------------------------------
        // fill parsedData and parsedTemplates

        prototyper.parseFolders(folderPaths);

        console.log(" \n\n- - prototyper.parsedData - - ");
        console.log(prototyper.parsedData);

        console.log(" \n\n- - prototyper.parsedTemplates - - ");
        console.log(prototyper.parsedTemplates);
        // console.log(prototyper.parsedTemplates);


        // parsedTemplates =

        // 2. FILL PARSED RESULTS (only element at first)
        // ------------------------------------------
        prototyper.fillTemplatesWithData(prototyper.parsedTemplates, prototyper.parsedData);


        // console.log(" \n\n- - prototyper.parsedResult - - ");
        // console.log(prototyper.parsedResult);

        // NOW elements are ready for using

        var blocksTemplates = prototyper.parsedTemplates["blocks"];
        // console.log("\n\n - - blocksTemplates - - ");
        // console.log(blocksTemplates);
        for (var templateKey in blocksTemplates){
            var template = blocksTemplates[templateKey];
            var data = prototyper.parsedResult["elements"];
            var renderedContent = mustache.render(template, data);

            // console.log("\n\n** templateKey: " + templateKey);
            // console.log(renderedContent);
            if(!prototyper.parsedResult["blocks"]){
                prototyper.parsedResult["blocks"] = {};
            }
            prototyper.parsedResult["blocks"][templateKey] = renderedContent;
        }

        var modulesTemplates = prototyper.parsedTemplates["modules"];
        // console.log("\n\n - - modulesTemplates - - ");
        // console.log(modulesTemplates);
        for (var templateKey in modulesTemplates){
            var template = modulesTemplates[templateKey];
            var data = prototyper.parsedResult["blocks"];
            var renderedContent = mustache.render(template, data);

            console.log("\n\n** templateKey: " + templateKey);
            console.log(renderedContent);
            prototyper.parsedResult["modules"] = renderedContent;
        }









        // fill parsedTemplates, parsedData, parsedResult

        // console.log("- - templatesComponents - - ");
        // console.log(templatesComponents);

        // console.log("\n - - parsedTemplates - - ");
        // console.log(parsedTemplates);

        // console.log("\n - - parsedData - - ");
        // console.log(parsedData);






        // PAINT ADDITIONAL TEMPLATES
        // ------------------------------------------

        for (var configItem in config) {
            // console.log(" - CONFIGITEM - ");
            // console.log(configItem);
            var requestedElemsList = config[configItem];
            var existedElementsList = parsedData["elements"];
            // var remappedElements = remapObject(existedElementsList, requestedElemsList);

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

            // var renderedTemplate = parseDataByTemplates(parsedTemplates, newDataSet);

            // console.log(" \n- - NEW renderedTemplate - - ");
            // console.log(renderedTemplate);

            // finalData.templates.push({
            //     "name": configItem,
            //     "content": renderedTemplate
            // });
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

        /**
        * Fill parsedResult
        */


        //************************************ TRASHCAN

        /**
        * Fill parsedResult
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

                    if (!parsedResult[dataGroupKey]){
                        parsedResult[dataGroupKey] = {};
                    }
                    parsedResult[dataGroupKey][dataItemKey] = parsedContent;
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