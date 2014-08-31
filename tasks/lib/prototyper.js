var prototyper = {};

var path = require("path"),
    grunt = require("grunt"),
    mustache = require("mustache");

prototyper.test = function() {
    console.log("test works");
};

prototyper.parsedTemplates = {};
prototyper.parsedData = {};
prototyper.parsedResults = {};
prototyper.componentsLists = {};
prototyper.finalData = {
    "templates": []
};


prototyper.parseFolders = function(folderPaths) {

    folderPaths.forEach(function(folderPath) {
        var folderName = path.basename(folderPath);
        prototyper.parseFolder(folderPath);
    });

};

/**
 * Get folder by path, parse it and fill objects by data and templates
 * Fill parsedTemplates and parsedData

 */
prototyper.parseFolder = function(folderPath) {
    var parsedTemplates = this.parsedTemplates;
    var parsedData = this.parsedData;

    var folderName = path.basename(folderPath);
    var sources = grunt.file.expand(folderPath + "*");

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
        }
        parsedTemplates[folderName][srcFolderName] = itemTemplate;
        parsedData[folderName][srcFolderName] = itemJson;
        parsedData[folderName][srcFolderName].toString = function() {
            var jsonString = JSON.stringify(itemJson);
            return jsonString === "{}" ? "" : jsonString;
        };

    });

};

/**
 * Fill parsedResult by folders [elements, blocks, modules]
 */
prototyper.fillTemplatesWithData = function(templatesSet, dataSet) {

    for (var dataGroupKey in dataSet) {
        var dataGroup = dataSet[dataGroupKey];
        var templatesGroup = templatesSet[dataGroupKey];

        for (var dataItemKey in dataGroup) {
            var dataItem = dataGroup[dataItemKey];
            var templateItem = templatesGroup[dataItemKey];

            if (!dataItem.toString()) {
                continue;
            }
            var parsedContent = mustache.render(templateItem, dataItem);

            if (!prototyper.parsedResults[dataGroupKey]) {
                prototyper.parsedResults[dataGroupKey] = {};
            }
            prototyper.parsedResults[dataGroupKey][dataItemKey] = parsedContent;
        }
    }
};

/**
 * Fill parsedResult for particular folder
 * and place it to parsedResult
 * @params params.templatesKey
 * @params params.parsResultKey
 */

prototyper.fillTemplatesByKey = function(params) {
    var templatesKey = params.templatesKey,
        parsResultKey = params.parsResultKey,
        myParsedResults = params.myParsedResults,
        modifKey = params.modifKey,
        modifList = params.modifList,
        wrapperClass = params.wrapperClass;

    var resultsObj = myParsedResults ? myParsedResults : prototyper.parsedResults;
    var blocksTemplates = prototyper.parsedTemplates[templatesKey];

    for (var templateKey in blocksTemplates) {

        var template = blocksTemplates[templateKey];
        var data = resultsObj[parsResultKey];
        var renderedContent = mustache.render(template, data);

        if (renderedContent) {
            if (!prototyper.parsedResults[templatesKey]) {
                prototyper.parsedResults[templatesKey] = {};
            }
            if (modifKey) {
                templateKey = templateKey + "--" + modifKey;
                prototyper.componentsLists[templateKey] = modfListToList(modifList);
            }
            if (wrapperClass) {
                renderedContent = "<div class=" + wrapperClass + ">" + renderedContent + "</div>";
            }
            prototyper.parsedResults[templatesKey][templateKey] = renderedContent;
        }
    }
};

function modfListToList(modifList) {
    var output = "";

    if (!Array.isArray(modifList)) {
        return;
    }

    modifList.forEach(function(item) {
        output += "<li>" + item + "</li>";
    });
    return "<ul>" + output + "</ul>";
}

prototyper.remapObject = function(oldElements, modifList) {
    var newElements = {};

    if (!Array.isArray(modifList)) {
        return;
    }

    modifList.forEach(function(modifKey) {
        newElements[modifKey] = oldElements[modifKey];
    });

    return newElements;
};

prototyper.createModification = function(modifKey, modifList) {

    var oldElements = prototyper.parsedResults["elements"];
    var wrapperClass = "";

    if (!Array.isArray(modifList)) {
        wrapperClass = modifList["wrapper-class"];
        modifList = modifList["elements"];
    }
    var newElements = prototyper.remapObject(oldElements, modifList);

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
        "modifKey": modifKey,
        "modifList": modifList,
        "wrapperClass": wrapperClass
    };
    prototyper.fillTemplatesByKey(paramsModules2);
};

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
module.exports = prototyper;