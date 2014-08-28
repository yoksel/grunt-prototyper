var prototyper = {};

var path = require("path"),
    grunt = require("grunt"),
    mustache = require("mustache");

prototyper.test = function () {
    console.log("test works");
};

prototyper.parsedTemplates = {};
prototyper.parsedData = {};
prototyper.parsedResult = {};


prototyper.parseFolders = function(folderPaths){

    folderPaths.forEach(function(folderPath) {
        var folderName = path.basename(folderPath);

        // console.log("folderName: " + folderName);

        prototyper.parseFolder(folderPath);


        // parseFolder(folderPath);
        // templatesComponents[folderName] = parseFolder(folderPath);
    });

    // console.log(" \n\n\n\ - - this.parsedTemplates - - ");
    // console.log(this.parsedTemplates);

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

    // console.log("prototyper.parseFolder IN WORK");

    // console.log(sources);

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

        // console.log(parsedTemplates);

    });

};


/**
* Fill parsedResult
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

            if (!prototyper.parsedResult[dataGroupKey]){
                prototyper.parsedResult[dataGroupKey] = {};
            }
            prototyper.parsedResult[dataGroupKey][dataItemKey] = parsedContent;
        }
    }
};

module.exports = prototyper;