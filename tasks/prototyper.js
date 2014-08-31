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

        var cwd = this.data.cwd,
            options = this.options(),
            openResult = options.openResult,
            componentsFolder = this.data.componentsFolder,
            templatesFolder = cwd + this.data.templatesFolder,
            defTemplatesFolder = __dirname + "/templates/",
            includesFolder = cwd + this.data.includesFolder,
            defIncludesFolder = __dirname + "/includes/",
            configFile = cwd + this.data.config,
            config = {},
            parsedTemplates = {},
            parsedData = {},
            parsedResults = {},
            elementsPath = cwd + componentsFolder + "elements/",
            blocksPath = cwd + componentsFolder + "blocks/",
            modulePath = cwd + componentsFolder + "modules/",
            resultFile = cwd + "index.html";

        if (grunt.file.exists(configFile)) {
            config = grunt.file.readJSON(configFile);
        }

        var folderPaths = [elementsPath, blocksPath, modulePath];

        // 1. PARSE FOLDERS FIRST
        // ------------------------------------------
        // fill parsedData and parsedTemplates

        prototyper.parseFolders(folderPaths);

        // 2. FILL PARSED RESULTS (only element at first)
        // ------------------------------------------
        // first fill of parsedResults

        prototyper.fillTemplatesWithData(prototyper.parsedTemplates, prototyper.parsedData);

        // 3. Parse all set from elements to modules
        // ------------------------------------------
        // get full module

        var paramsBlocks = {
            "templatesKey": "blocks",
            "parsResultKey": "elements"
        };
        prototyper.fillTemplatesByKey(paramsBlocks);

        var paramsModules = {
            "templatesKey": "modules",
            "parsResultKey": "blocks"
        };
        prototyper.fillTemplatesByKey(paramsModules);


        // 4. Fill additional templates
        // ------------------------------------------

        for (var modifKey in config) {
            var modifItem = config[modifKey];
            prototyper.createModification(modifKey, modifItem);
            prototyper.componentsLists[modifKey] = modifItem;
        }

        // 5. Fill result
        // ------------------------------------------

        var finalModules = prototyper.parsedResults.modules;

        if (finalModules) {
            for (var item in finalModules) {
                prototyper.finalData.templates.push({
                    "name": item,
                    "content": finalModules[item],
                    "components": prototyper.componentsLists[item]
                });
            }
        }

        // 6. Fill Elements
        // ------------------------------------------

        var finalElements = prototyper.parsedResults.elements;

        if (finalElements) {
            if (!prototyper.finalData.elems) {
                prototyper.finalData.elems = [];
            }
            for (var itemElem in finalElements) {
                prototyper.finalData.elems.push({
                    "name": itemElem,
                    "content": finalElements[itemElem]
                });
            }
        }

        // if (grunt.file.exists(includesFolder)) {
        //     var includes = grunt.file.expand(includesFolder + "*");
        //     includes.forEach(function(filePath) {
        //         var includedContent = grunt.file.read(filePath);
        //         var fileName = path.basename(filePath, path.extname(filePath));
        //         prototyper.finalData[fileName] = includedContent;
        //     });
        // }

        prototyper.addIncludes = function(folderPath) {

            if (grunt.file.exists(folderPath)) {
                var includes = grunt.file.expand(folderPath + "*");

                includes.forEach(function(itemPath) {
                    var itemName = path.basename(itemPath, path.extname(itemPath));

                    if (grunt.file.isFile(itemPath)) {

                        var includedContent = grunt.file.read(itemPath);
                        prototyper.finalData[itemName] = includedContent;
                    } else {
                        prototyper.customIncludes(itemPath);

                    }

                });
            }
        };

        prototyper.customIncludes = function(itemPath) {
            var itemName = path.basename(itemPath, path.extname(itemPath));
            var innerIncludes = grunt.file.expand(itemPath + "**/*");
            var tagsByExts = {
                ".js": "script",
                ".css": "style"
            };

            innerIncludes.forEach(function(filePath) {

                var fileName = path.basename(itemPath, path.extname(itemPath));
                var fileExt = path.extname(filePath);
                var tag = tagsByExts[fileExt];
                var includedContent = grunt.file.read(filePath);

                if (!prototyper.finalData[itemName]) {
                    prototyper.finalData[itemName] = [];
                }

                var fileObj = {
                    "content": includedContent
                };

                if (tag) {
                    fileObj.opentag = "<" + tag + ">";
                    fileObj.closetag = "</" + tag + ">";
                }

                prototyper.finalData[itemName].push(fileObj);
            });
        };



        prototyper.addIncludes(defIncludesFolder);
        prototyper.addIncludes(includesFolder);



        var indexTempltPath = defTemplatesFolder + "index.html";
        var customIndexTempltPath = templatesFolder + "index.html";

        if (grunt.file.exists(customIndexTempltPath)) {
            indexTempltPath = customIndexTempltPath;
        }

        var indexTemplate = grunt.file.read(indexTempltPath);

        var result = mustache.render(indexTemplate, prototyper.finalData);

        grunt.file.write(resultFile, result);

        openResult = (openResult === undefined) ? true : openResult;
        if (openResult) {
            open(resultFile);
        }

    });

};