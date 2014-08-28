var prototyper = {};

var path = require("path"),
    grunt = require("grunt"),
    mustache = require("mustache");

prototyper.test = function () {
    console.log("test works");
};

prototyper.parsedTemplates = {};
prototyper.parsedData = {};
prototyper.parsedResults = {};


prototyper.parseFolders = function(folderPaths){

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
        parsedData[folderName][srcFolderName].toString = function(){
            var jsonString = JSON.stringify(itemJson);
            return jsonString === "{}" ? "" : jsonString;
        };

    });

};

/**
* Fill parsedResult by folders [elements, blocks, modules]
*/
prototyper.fillTemplatesWithData = function(templatesSet, dataSet){

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

            if (!prototyper.parsedResults[dataGroupKey]){
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

prototyper.fillTemplatesByKey = function(params){
    var templatesKey = params.templatesKey,
        parsResultKey = params.parsResultKey,
        myParsedResults = params.myParsedResults,
        modification = params.modification;

        var resultsObj = myParsedResults ? myParsedResults : prototyper.parsedResults;
        var blocksTemplates = prototyper.parsedTemplates[templatesKey];

        for (var templateKey in blocksTemplates){

            var template = blocksTemplates[templateKey];
            var data = resultsObj[parsResultKey];
            var renderedContent = mustache.render(template, data);

            if (renderedContent){
                if(!prototyper.parsedResults[templatesKey]){
                    prototyper.parsedResults[templatesKey] = {};
                }
                if (modification){
                    templateKey = templateKey + modification;
                }
                prototyper.parsedResults[templatesKey][templateKey] = renderedContent;
            }
         }
};

module.exports = prototyper;